import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import { Composer, InlineKeyboard } from 'grammy'
import type { GetNowPlayingUseCase } from '../../application/use-cases/get-now-playing.js'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import { requireLastfmLinked } from '../../application/use-cases/login.js'
import type { NowPlayingInfo } from '../../domain/entities/now-playing.js'
import type { FreshBeatContext } from '../context.js'
import { formatNowPlaying, type NowPlayingLabels } from '../formatters/now-playing.formatter.js'
import { LYRICS_STATE_NAMESPACE, LYRICS_STATE_TTL_SECONDS } from '../lyrics-message.js'
import { loadingMessage } from '../middlewares/locale.middleware.js'
import type { CommandModule } from './command-module.js'

const listeningNowLabel = msg({
  key: 'playingnow.listening_now',
  value: '🎧 <b>{{user}}</b> está ouvindo agora:',
})
const listeningWasLabel = msg({
  key: 'playingnow.listening_was',
  value: '🎧 <b>{{user}}</b> estava ouvindo:',
})
const explicitBadge = msg({ key: 'playingnow.explicit_badge', value: '🅴' })
const scrobblesTitle = msg({ key: 'playingnow.scrobbles_title', value: '📊 <b>Scrobbles</b>' })
const scrobblesTrackLabel = msg({ key: 'playingnow.scrobbles_track', value: '🎵 {{count}}' })
const scrobblesAlbumLabel = msg({ key: 'playingnow.scrobbles_album', value: '💿 {{count}}' })
const scrobblesArtistLabel = msg({ key: 'playingnow.scrobbles_artist', value: '🎤 {{count}}' })
const listeningTimeLabel = msg({
  key: 'playingnow.listening_time',
  value: '⏱️ Você já ouviu essa música por <b>{{duration}}</b>',
})
const popularityLabel = msg({ key: 'playingnow.popularity', value: '⭐ Popularidade: {{stars}}' })
const hoursMinutesLabel = msg({
  key: 'common.duration.hours_minutes',
  value: '{{hours}}h {{minutes}}min',
})
const minutesOnlyLabel = msg({ key: 'common.duration.minutes', value: '{{minutes}}min' })
const lyricsButtonLabel = msg({ key: 'playingnow.lyrics_button', value: '🧾 Letra' })
const explainButtonLabel = msg({ key: 'lyrics.explain_button', value: '✨ Explicar' })

export interface PlayingNowCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  getNowPlaying: GetNowPlayingUseCase
  tempStateStore: TempStateStore
  /** Quando true, mostra o botão de explicação por IA. */
  aiEnabled: boolean
}

export function createPlayingNowCommand(deps: PlayingNowCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  // /pn e /pntrack são aliases do mesmo card unificado — no MelodyScout
  // /pntrack duplicava o playingnow com outro formato; aqui um use case
  // serve todos (sem duplicação comando×callback).
  composer.command(['playingnow', 'pn', 'pntrack'], async (ctx) => {
    const from = ctx.from
    if (from === undefined) return

    const { user } = await deps.getOrCreateUser.execute(from.id)
    requireLastfmLinked(user)

    // UX progressiva: responde rápido e edita com o resultado
    const loading = await ctx.reply(ctx.t(loadingMessage))
    const info = await deps.getNowPlaying.execute({ lastfmUsername: user.lastfmUsername })

    const text = formatNowPlaying(info, buildLabels(ctx, info))
    const keyboard = await buildKeyboard(ctx, deps, info)

    await ctx.api.editMessageText(ctx.chat.id, loading.message_id, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })
  })

  return {
    name: 'playingnow',
    description: msg({
      key: 'cmd.playingnow.description',
      value: 'O que você está ouvindo agora',
    }),
    composer,
  }
}

function buildLabels(ctx: FreshBeatContext, info: NowPlayingInfo): NowPlayingLabels {
  const user = info.lastfmUsername
  return {
    listeningNow: ctx.t(listeningNowLabel, { user }),
    listeningWas: ctx.t(listeningWasLabel, { user }),
    explicitBadge: ctx.t(explicitBadge),
    scrobblesTitle: ctx.t(scrobblesTitle),
    scrobblesTrack: (count) => ctx.t(scrobblesTrackLabel, { count }),
    scrobblesAlbum: (count) => ctx.t(scrobblesAlbumLabel, { count }),
    scrobblesArtist: (count) => ctx.t(scrobblesArtistLabel, { count }),
    listeningTime: (duration) => ctx.t(listeningTimeLabel, { duration }),
    popularity: (stars) => ctx.t(popularityLabel, { stars }),
    hoursMinutes: (hours, minutes) =>
      ctx.t(hoursMinutesLabel, { hours: String(hours), minutes: String(minutes) }),
    minutesOnly: (minutes) => ctx.t(minutesOnlyLabel, { minutes: String(minutes) }),
  }
}

async function buildKeyboard(
  ctx: FreshBeatContext,
  deps: PlayingNowCommandDeps,
  info: NowPlayingInfo,
): Promise<InlineKeyboard> {
  const keyboard = new InlineKeyboard()

  // Botões de letra/explicação usam o mesmo token de estado (TrackRef)
  const token = await deps.tempStateStore.create(
    LYRICS_STATE_NAMESPACE,
    { name: info.trackName, artist: info.artistName },
    LYRICS_STATE_TTL_SECONDS,
  )
  keyboard.text(ctx.t(lyricsButtonLabel), `lyr:get:${token}`)
  if (deps.aiEnabled) {
    keyboard.text(ctx.t(explainButtonLabel), `lyr:ex:${token}`)
  }

  keyboard.row()
  if (info.links.spotify !== null) keyboard.url('Spotify', info.links.spotify)
  if (info.links.deezer !== null) keyboard.url('Deezer', info.links.deezer)

  return keyboard
}
