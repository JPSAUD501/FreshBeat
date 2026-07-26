import { msg, type MessageDescriptor } from '@freshbeat/i18n'
import { Composer, InlineKeyboard } from 'grammy'
import type {
  GetAlbumOverviewUseCase,
  GetArtistOverviewUseCase,
} from '../../application/use-cases/get-overview.js'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import { requireLastfmLinked } from '../../application/use-cases/login.js'
import type { EntityOverview } from '../../domain/entities/overview.js'
import type { FreshBeatContext } from '../context.js'
import { formatOverview, type OverviewLabels } from '../formatters/overview.formatter.js'
import { loadingMessage } from '../middlewares/locale.middleware.js'
import type { CommandModule } from './command-module.js'

const artistLineLabel = msg({ key: 'overview.artist_line', value: '🎤 {{artist}}' })
const scrobblesLabel = msg({ key: 'overview.scrobbles', value: '📊 <b>{{count}}</b> scrobbles' })
const playtimeLabel = msg({
  key: 'overview.playtime',
  value: '⏱️ Tempo total: <b>{{duration}}</b>',
})
const topTracksTitle = msg({ key: 'overview.top_tracks', value: '🎶 <b>As suas mais ouvidas:</b>' })
const hoursMinutesLabel = msg({
  key: 'common.duration.hours_minutes',
  value: '{{hours}}h {{minutes}}min',
})
const minutesOnlyLabel = msg({ key: 'common.duration.minutes', value: '{{minutes}}min' })

const albumNowLabel = msg({
  key: 'overview.album_now',
  value: '🎧 <b>{{user}}</b> está ouvindo o álbum:',
})
const albumWasLabel = msg({
  key: 'overview.album_was',
  value: '🕐 <b>{{user}}</b> estava ouvindo o álbum:',
})
const artistNowLabel = msg({
  key: 'overview.artist_now',
  value: '🎧 <b>{{user}}</b> está ouvindo o artista:',
})
const artistWasLabel = msg({
  key: 'overview.artist_was',
  value: '🕐 <b>{{user}}</b> estava ouvindo o artista:',
})

export interface OverviewCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  getAlbumOverview: GetAlbumOverviewUseCase
  getArtistOverview: GetArtistOverviewUseCase
}

interface OverviewCommandConfig {
  kind: 'album' | 'artist'
  commandName: string
  description: MessageDescriptor
  titleNow: MessageDescriptor
  titleWas: MessageDescriptor
  execute: (deps: OverviewCommandDeps, username: string) => Promise<EntityOverview>
}

/** /pnalbum e /pnartist — mesma estrutura, mesma UX progressiva. */
function createOverviewCommand(
  deps: OverviewCommandDeps,
  config: OverviewCommandConfig,
): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command(config.commandName, async (ctx) => {
    const from = ctx.from
    if (from === undefined) return

    const { user } = await deps.getOrCreateUser.execute(from.id)
    requireLastfmLinked(user)

    const loading = await ctx.reply(ctx.t(loadingMessage))
    const overview = await config.execute(deps, user.lastfmUsername)

    const text = formatOverview(overview, config.kind, buildLabels(ctx, config, overview))
    const keyboard = buildKeyboard(overview)

    await ctx.api.editMessageText(ctx.chat.id, loading.message_id, text, {
      parse_mode: 'HTML',
      ...(keyboard !== undefined ? { reply_markup: keyboard } : {}),
    })
  })

  return { name: config.commandName, description: config.description, composer }
}

function buildLabels(
  ctx: FreshBeatContext,
  config: OverviewCommandConfig,
  overview: EntityOverview,
): OverviewLabels {
  const user = overview.username
  return {
    titleNow: ctx.t(config.titleNow, { user }),
    titleWas: ctx.t(config.titleWas, { user }),
    artistLine: (artist) => ctx.t(artistLineLabel, { artist }),
    scrobbles: (count) => ctx.t(scrobblesLabel, { count }),
    playtime: (duration) => ctx.t(playtimeLabel, { duration }),
    topTracksTitle: ctx.t(topTracksTitle),
    hoursMinutes: (hours, minutes) =>
      ctx.t(hoursMinutesLabel, { hours: String(hours), minutes: String(minutes) }),
    minutesOnly: (minutes) => ctx.t(minutesOnlyLabel, { minutes: String(minutes) }),
  }
}

function buildKeyboard(overview: EntityOverview): InlineKeyboard | undefined {
  const keyboard = new InlineKeyboard()
  if (overview.spotifyUrl !== null) keyboard.url('Spotify', overview.spotifyUrl)
  if (overview.deezerUrl !== null) keyboard.url('Deezer', overview.deezerUrl)
  return keyboard.inline_keyboard.length > 0 ? keyboard : undefined
}

/** Cria os comandos /pnalbum e /pnartist com as dependências injetadas. */
export function createOverviewCommands(deps: OverviewCommandDeps): CommandModule[] {
  return [
    createOverviewCommand(deps, {
      kind: 'album',
      commandName: 'pnalbum',
      description: msg({
        key: 'cmd.pnalbum.description',
        value: 'Álbum da música que está tocando',
      }),
      titleNow: albumNowLabel,
      titleWas: albumWasLabel,
      execute: (d, username) => d.getAlbumOverview.execute({ username }),
    }),
    createOverviewCommand(deps, {
      kind: 'artist',
      commandName: 'pnartist',
      description: msg({
        key: 'cmd.pnartist.description',
        value: 'Artista da música que está tocando',
      }),
      titleNow: artistNowLabel,
      titleWas: artistWasLabel,
      execute: (d, username) => d.getArtistOverview.execute({ username }),
    }),
  ]
}
