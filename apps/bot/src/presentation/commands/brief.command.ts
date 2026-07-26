import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { BriefResult, GetBriefUseCase } from '../../application/use-cases/get-brief.js'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import { requireLastfmLinked } from '../../application/use-cases/login.js'
import type { FreshBeatContext } from '../context.js'
import { formatBrief, type BriefLabels } from '../formatters/brief.formatter.js'
import { loadingMessage } from '../middlewares/locale.middleware.js'
import type { CommandModule } from './command-module.js'

const titleLabel = msg({ key: 'brief.title', value: '📊 <b>Resumo musical de {{user}}</b>' })
const metricsLine1Label = msg({
  key: 'brief.metrics_line1',
  value:
    '🎵 {{playcount}} scrobbles · 🎼 {{tracks}} faixas · 🔁 {{repeated}} repetidas ({{percent}}%)',
})
const metricsLine2Label = msg({
  key: 'brief.metrics_line2',
  value: '🎤 {{artists}} artistas · 💿 {{albums}} álbuns',
})
const playtimeLabel = msg({ key: 'brief.playtime', value: '⏱️ Tempo total: <b>{{duration}}</b>' })
const avgDurationLabel = msg({ key: 'brief.avg_duration', value: '📏 Duração média: {{duration}}' })
const topTracksTitle = msg({ key: 'brief.top_tracks', value: '🎵 <b>Músicas mais tocadas</b>' })
const topAlbumsTitle = msg({ key: 'brief.top_albums', value: '💿 <b>Álbuns mais tocados</b>' })
const topArtistsTitle = msg({ key: 'brief.top_artists', value: '🎤 <b>Artistas mais tocados</b>' })
const hoursMinutesLabel = msg({
  key: 'common.duration.hours_minutes',
  value: '{{hours}}h {{minutes}}min',
})
const minutesOnlyLabel = msg({ key: 'common.duration.minutes', value: '{{minutes}}min' })
const minutesSecondsLabel = msg({
  key: 'common.duration.minutes_seconds',
  value: '{{minutes}}min {{seconds}}s',
})

export interface BriefCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  getBrief: GetBriefUseCase
}

export function createBriefCommand(deps: BriefCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('brief', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return

    const { user } = await deps.getOrCreateUser.execute(from.id)
    requireLastfmLinked(user)

    // UX progressiva: responde rápido e edita com o resumo
    // (o cálculo pesado vem cacheado do GetUserTopTracksUseCase)
    const loading = await ctx.reply(ctx.t(loadingMessage))
    const brief = await deps.getBrief.execute({ username: user.lastfmUsername })

    await ctx.api.editMessageText(
      ctx.chat.id,
      loading.message_id,
      formatBrief(brief, buildLabels(ctx, brief)),
      {
        parse_mode: 'HTML',
      },
    )
  })

  return {
    name: 'brief',
    description: msg({ key: 'cmd.brief.description', value: 'Resumo do seu perfil musical' }),
    composer,
  }
}

function buildLabels(ctx: FreshBeatContext, brief: BriefResult): BriefLabels {
  const { playcount, trackCount, artistCount, albumCount } = brief.metrics
  const repeated = Math.max(0, playcount - trackCount)
  const repeatedPercent = playcount > 0 ? Math.round((repeated / playcount) * 100) : 0

  return {
    title: ctx.t(titleLabel, { user: brief.username }),
    metricsLine1: ctx.t(metricsLine1Label, {
      playcount: playcount.toLocaleString(ctx.locale),
      tracks: trackCount.toLocaleString(ctx.locale),
      repeated: repeated.toLocaleString(ctx.locale),
      percent: String(repeatedPercent),
    }),
    metricsLine2: ctx.t(metricsLine2Label, {
      artists: artistCount.toLocaleString(ctx.locale),
      albums: albumCount.toLocaleString(ctx.locale),
    }),
    playtime: (duration) => ctx.t(playtimeLabel, { duration }),
    avgDuration: (duration) => ctx.t(avgDurationLabel, { duration }),
    topTracksTitle: ctx.t(topTracksTitle),
    topAlbumsTitle: ctx.t(topAlbumsTitle),
    topArtistsTitle: ctx.t(topArtistsTitle),
    hoursMinutes: (hours, minutes) =>
      ctx.t(hoursMinutesLabel, { hours: String(hours), minutes: String(minutes) }),
    minutesOnly: (minutes) => ctx.t(minutesOnlyLabel, { minutes: String(minutes) }),
    minutesSeconds: (minutes, seconds) =>
      ctx.t(minutesSecondsLabel, { minutes: String(minutes), seconds: String(seconds) }),
    numberLocale: ctx.locale,
  }
}
