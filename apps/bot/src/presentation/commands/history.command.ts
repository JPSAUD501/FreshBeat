import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetHistoryUseCase, HistoryResult } from '../../application/use-cases/get-history.js'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import { requireLastfmLinked } from '../../application/use-cases/login.js'
import type { FreshBeatContext } from '../context.js'
import { escapeHtml } from '../formatters/lyrics.formatter.js'
import { loadingMessage } from '../middlewares/locale.middleware.js'
import type { CommandModule } from './command-module.js'

const titleLabel = msg({ key: 'history.title', value: '📒 <b>Histórico de {{user}}</b>' })
const nowPlayingLabel = msg({ key: 'history.now_playing', value: '🎧 Ouvindo agora: {{track}}' })
const emptyMessage = msg({
  key: 'history.empty',
  value: '📭 Você ainda não tem histórico no Last.fm.',
})

export interface HistoryCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  getHistory: GetHistoryUseCase
}

export function createHistoryCommand(deps: HistoryCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('history', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return

    const { user } = await deps.getOrCreateUser.execute(from.id)
    requireLastfmLinked(user)

    const loading = await ctx.reply(ctx.t(loadingMessage))
    const history = await deps.getHistory.execute({ username: user.lastfmUsername })

    const text =
      history.entries.length === 0 && history.nowPlaying === null
        ? ctx.t(emptyMessage)
        : formatHistory(ctx, history)

    await ctx.api.editMessageText(ctx.chat.id, loading.message_id, text, { parse_mode: 'HTML' })
  })

  return {
    name: 'history',
    description: msg({ key: 'cmd.history.description', value: 'Suas últimas faixas' }),
    composer,
  }
}

function formatHistory(ctx: FreshBeatContext, history: HistoryResult): string {
  const lines: string[] = [ctx.t(titleLabel, { user: history.username })]

  if (history.nowPlaying !== null) {
    lines.push(
      '',
      ctx.t(nowPlayingLabel, {
        track: `${escapeHtml(history.nowPlaying.name)} — ${escapeHtml(history.nowPlaying.artist)}`,
      }),
    )
  }

  if (history.entries.length > 0) {
    lines.push('')
    for (const entry of history.entries) {
      const label = `${escapeHtml(entry.name)} — ${escapeHtml(entry.artist)}`
      const linked = entry.url !== null ? `<a href="${entry.url}">${label}</a>` : `<b>${label}</b>`
      const repeat = entry.playCount > 1 ? `(${entry.playCount}x) ` : ''
      lines.push(`- ${repeat}${linked}`)
    }
  }

  return lines.join('\n')
}
