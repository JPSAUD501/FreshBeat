import { createRedisClient, RateLimiter, RedisCacheStore, TempStateStore } from '@freshbeat/cache'
import { loadConfig, type Config } from '@freshbeat/config'
import { createDatabase } from '@freshbeat/database'
import { createLogger, type Logger } from '@freshbeat/logging'
import type { Bot, Composer } from 'grammy'
import { GetLyricsUseCase } from '../application/use-cases/get-lyrics.js'
import { GetOrCreateUserUseCase } from '../application/use-cases/get-or-create-user.js'
import { StartLoginUseCase, UnlinkLastfmUseCase } from '../application/use-cases/login.js'
import { TranslateLyricsUseCase } from '../application/use-cases/translate-lyrics.js'
import { OpenRouterTextGenerator } from '../infrastructure/ai/openrouter-text.js'
import { LastFmClient } from '../infrastructure/lastfm/lastfm-client.js'
import { LrcmuxProvider } from '../infrastructure/lyrics/lrcmux.provider.js'
import { LrclibProvider } from '../infrastructure/lyrics/lrclib.provider.js'
import { LyricsOvhProvider } from '../infrastructure/lyrics/lyrics-ovh.provider.js'
import { DrizzleErrorLogRepository } from '../infrastructure/persistence/drizzle-error-log-repository.js'
import { DrizzleUserRepository } from '../infrastructure/persistence/drizzle-user-repository.js'
import { createBot } from '../presentation/bot.js'
import { createTranslateLyricsCallback } from '../presentation/callbacks/translate-lyrics.callback.js'
import type { CommandModule } from '../presentation/commands/command-module.js'
import { createForgetMeCommand } from '../presentation/commands/forgetme.command.js'
import { createHelpCommand } from '../presentation/commands/help.command.js'
import { createLoginCommand } from '../presentation/commands/login.command.js'
import { createLyricsCommand } from '../presentation/commands/lyrics.command.js'
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
  // IA é opcional: sem o grupo `ai` configurado, o botão de traduzir some
  const aiTextGenerator =
    config.ai !== undefined
      ? new OpenRouterTextGenerator({
          apiKey: config.ai.OPENROUTER_API_KEY,
          model: config.ai.AI_MODEL_TRANSLATE,
        })
      : undefined

  // Use cases
  const getOrCreateUser = new GetOrCreateUserUseCase(userRepository)
  const startLogin = new StartLoginUseCase(tempStateStore, config.web.WEB_BASE_URL)
  const unlinkLastfm = new UnlinkLastfmUseCase(userRepository)
  const getLyrics = new GetLyricsUseCase(lyricsProviders, cacheStore, logger)
  const translateLyrics =
    aiTextGenerator !== undefined
      ? new TranslateLyricsUseCase(aiTextGenerator, cacheStore)
      : undefined

  // Comandos (apresentação)
  const commands = [
    createStartCommand({ getOrCreateUser }),
    createHelpCommand(),
    createLoginCommand({ getOrCreateUser, startLogin }),
    createForgetMeCommand({ getOrCreateUser, unlinkLastfm }),
    createLyricsCommand({
      getOrCreateUser,
      recentTracks: lastFmClient,
      getLyrics,
      tempStateStore,
      translationEnabled: translateLyrics !== undefined,
    }),
  ]

  // Callbacks/listeners
  const listeners: Composer<FreshBeatContext>[] = []
  if (translateLyrics !== undefined) {
    listeners.push(createTranslateLyricsCallback({ tempStateStore, getLyrics, translateLyrics }))
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
