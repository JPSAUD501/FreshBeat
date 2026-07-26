import { createRedisClient, RateLimiter, RedisCacheStore, TempStateStore } from '@freshbeat/cache'
import { loadConfig, type Config } from '@freshbeat/config'
import { createDatabase } from '@freshbeat/database'
import { createLogger, type Logger } from '@freshbeat/logging'
import type { Bot, Composer } from 'grammy'
import { GetLyricsUseCase } from '../application/use-cases/get-lyrics.js'
import { GetHistoryUseCase } from '../application/use-cases/get-history.js'
import { GetNowPlayingUseCase } from '../application/use-cases/get-now-playing.js'
import { GetOrCreateUserUseCase } from '../application/use-cases/get-or-create-user.js'
import {
  GetAlbumOverviewUseCase,
  GetArtistOverviewUseCase,
} from '../application/use-cases/get-overview.js'
import { GetUserTopTracksUseCase } from '../application/use-cases/get-user-top-tracks.js'
import { ExplainLyricsUseCase } from '../application/use-cases/explain-lyrics.js'
import { GenerateLyricsImageUseCase } from '../application/use-cases/generate-lyrics-image.js'
import { StartLoginUseCase, UnlinkLastfmUseCase } from '../application/use-cases/login.js'
import { TranslateLyricsUseCase } from '../application/use-cases/translate-lyrics.js'
import type { MusicSearchProvider } from '../domain/ports/music-search.js'
import { OpenRouterTextGenerator } from '../infrastructure/ai/openrouter-text.js'
import { ReplicateImageGenerator } from '../infrastructure/images/replicate-image-generator.js'
import { LastFmClient } from '../infrastructure/lastfm/lastfm-client.js'
import { LrcmuxProvider } from '../infrastructure/lyrics/lrcmux.provider.js'
import { LrclibProvider } from '../infrastructure/lyrics/lrclib.provider.js'
import { LyricsOvhProvider } from '../infrastructure/lyrics/lyrics-ovh.provider.js'
import { DeezerClient } from '../infrastructure/music/deezer-client.js'
import { SpotifyClient } from '../infrastructure/music/spotify-client.js'
import { DrizzleErrorLogRepository } from '../infrastructure/persistence/drizzle-error-log-repository.js'
import { DrizzleUserRepository } from '../infrastructure/persistence/drizzle-user-repository.js'
import { S3ImageStorage } from '../infrastructure/storage/s3-image-storage.js'
import { createBot } from '../presentation/bot.js'
import { createExplainLyricsCallback } from '../presentation/callbacks/explain-lyrics.callback.js'
import { createGetLyricsCallback } from '../presentation/callbacks/get-lyrics.callback.js'
import { createTranslateLyricsCallback } from '../presentation/callbacks/translate-lyrics.callback.js'
import type { CommandModule } from '../presentation/commands/command-module.js'
import { createForgetMeCommand } from '../presentation/commands/forgetme.command.js'
import { createHelpCommand } from '../presentation/commands/help.command.js'
import { createHistoryCommand } from '../presentation/commands/history.command.js'
import { createLoginCommand } from '../presentation/commands/login.command.js'
import { createLyricsCommand } from '../presentation/commands/lyrics.command.js'
import { createOverviewCommands } from '../presentation/commands/overview.command.js'
import { createPlayingNowCommand } from '../presentation/commands/playingnow.command.js'
import { createStartCommand } from '../presentation/commands/start.command.js'
import type { FreshBeatContext } from '../presentation/context.js'

export interface AppContainer {
  config: Config
  logger: Logger
  bot: Bot<FreshBeatContext>
  commands: CommandModule[]
  /** Encerra recursos (banco, redis) no shutdown gracioso. */
  close: () => Promise<void>
}

/**
 * Composition root — o ÚNICO lugar onde `new` de adapters acontece.
 * Toda dependência é criada aqui e injetada via construtor nas
 * camadas internas (que só conhecem ports/interfaces).
 */
export function createContainer(): AppContainer {
  const config = loadConfig()
  const logger = createLogger({
    name: 'bot',
    level: config.logging.LOG_LEVEL,
    pretty: process.env.NODE_ENV !== 'production',
  })

  // Infraestrutura
  const { db, close: closeDatabase } = createDatabase(config.database.DATABASE_URL)
  const redis = createRedisClient(config.redis.REDIS_URL)
  const cacheStore = new RedisCacheStore(redis)
  const rateLimiter = new RateLimiter(cacheStore)
  const tempStateStore = new TempStateStore(cacheStore)

  // Repositories (adapters de persistência)
  const userRepository = new DrizzleUserRepository(db)
  const errorLogRepository = new DrizzleErrorLogRepository(db)

  // Adapters externos
  const lastFmClient = new LastFmClient(config.lastfm.LASTFM_API_KEY)
  const lyricsProviders = {
    primary: [new LrcmuxProvider(), new LrclibProvider()],
    fallback: new LyricsOvhProvider(),
  }
  // IA é opcional: sem o grupo `ai` configurado, os botões de IA somem

  // Imagem por IA exige Replicate + S3 (além do grupo `ai`)
  const imageGenerator =
    config.replicate !== undefined
      ? new ReplicateImageGenerator({ apiToken: config.replicate.REPLICATE_API_TOKEN })
      : undefined
  const imageStorage =
    config.s3 !== undefined
      ? new S3ImageStorage({
          endpoint: config.s3.S3_ENDPOINT,
          region: config.s3.S3_REGION,
          bucket: config.s3.S3_BUCKET,
          accessKey: config.s3.S3_ACCESS_KEY,
          secretKey: config.s3.S3_SECRET_KEY,
          publicUrl: config.s3.S3_PUBLIC_URL,
        })
      : undefined

  // Buscas em streaming (Spotify é opcional, Deezer é público)
  const musicSearch: MusicSearchProvider[] = [
    ...(config.spotify !== undefined
      ? [new SpotifyClient(config.spotify.SPOTIFY_CLIENT_ID, config.spotify.SPOTIFY_CLIENT_SECRET)]
      : []),
    new DeezerClient(),
  ]

  // Use cases
  const getOrCreateUser = new GetOrCreateUserUseCase(userRepository)
  const startLogin = new StartLoginUseCase(tempStateStore, config.web.WEB_BASE_URL)
  const unlinkLastfm = new UnlinkLastfmUseCase(userRepository)
  const getLyrics = new GetLyricsUseCase(lyricsProviders, cacheStore, logger)
  const getNowPlaying = new GetNowPlayingUseCase({
    recentTracks: lastFmClient,
    lastfm: lastFmClient,
    musicSearch,
    cache: cacheStore,
    logger,
  })
  const getUserTopTracks = new GetUserTopTracksUseCase(lastFmClient, cacheStore)
  const overviewDeps = {
    recentTracks: lastFmClient,
    lastfm: lastFmClient,
    musicSearch,
    getUserTopTracks,
    cache: cacheStore,
    logger,
  }
  const getAlbumOverview = new GetAlbumOverviewUseCase(overviewDeps)
  const getArtistOverview = new GetArtistOverviewUseCase(overviewDeps)
  const getHistory = new GetHistoryUseCase(lastFmClient, cacheStore)

  const translateLyrics =
    config.ai !== undefined
      ? new TranslateLyricsUseCase(
          new OpenRouterTextGenerator({
            apiKey: config.ai.OPENROUTER_API_KEY,
            model: config.ai.AI_MODEL_TRANSLATE,
          }),
          cacheStore,
        )
      : undefined

  const explainGenerators =
    config.ai !== undefined
      ? {
          imageDescriber: new OpenRouterTextGenerator({
            apiKey: config.ai.OPENROUTER_API_KEY,
            model: config.ai.AI_MODEL_IMAGE_PROMPT,
          }),
          explainer: new OpenRouterTextGenerator({
            apiKey: config.ai.OPENROUTER_API_KEY,
            model: config.ai.AI_MODEL_EXPLAIN,
          }),
          altTextWriter: new OpenRouterTextGenerator({
            apiKey: config.ai.OPENROUTER_API_KEY,
            model: config.ai.AI_MODEL_ALT_TEXT,
          }),
        }
      : undefined
  const explainLyrics =
    explainGenerators !== undefined
      ? new ExplainLyricsUseCase(explainGenerators, cacheStore)
      : undefined
  const generateLyricsImage =
    imageGenerator !== undefined && imageStorage !== undefined
      ? new GenerateLyricsImageUseCase(imageGenerator, imageStorage, cacheStore)
      : undefined

  // Comandos (apresentação)
  const commands = [
    createStartCommand({ getOrCreateUser }),
    createHelpCommand(),
    createLoginCommand({ getOrCreateUser, startLogin }),
    createForgetMeCommand({ getOrCreateUser, unlinkLastfm }),
    createPlayingNowCommand({
      getOrCreateUser,
      getNowPlaying,
      tempStateStore,
      aiEnabled: config.ai !== undefined,
    }),
    ...createOverviewCommands({ getOrCreateUser, getAlbumOverview, getArtistOverview }),
    createHistoryCommand({ getOrCreateUser, getHistory }),
    createLyricsCommand({
      getOrCreateUser,
      recentTracks: lastFmClient,
      getLyrics,
      tempStateStore,
      aiEnabled: config.ai !== undefined,
    }),
  ]

  // Callbacks/listeners
  const listeners: Composer<FreshBeatContext>[] = [
    createGetLyricsCallback({
      tempStateStore,
      getLyrics,
      aiEnabled: config.ai !== undefined,
    }),
  ]
  if (translateLyrics !== undefined) {
    listeners.push(createTranslateLyricsCallback({ tempStateStore, getLyrics, translateLyrics }))
  }
  if (explainLyrics !== undefined) {
    listeners.push(
      createExplainLyricsCallback({
        tempStateStore,
        getLyrics,
        explainLyrics,
        ...(generateLyricsImage !== undefined ? { generateLyricsImage } : {}),
        logger,
      }),
    )
  }

  const bot = createBot({
    token: config.telegram.BOT_TOKEN,
    logger,
    rateLimiter,
    errorLogRepository,
    commands,
    listeners,
  })

  return {
    config,
    logger,
    bot,
    commands,
    close: async () => {
      redis.disconnect()
      await closeDatabase()
    },
  }
}
