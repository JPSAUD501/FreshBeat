import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetLyricsUseCase } from '../../application/use-cases/get-lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { FreshBeatContext } from '../context.js'
import { lyricsFooter } from '../formatters/lyrics.formatter.js'
import { buildAiKeyboard, LYRICS_STATE_NAMESPACE, sendLyricsPages } from '../lyrics-message.js'

const expiredMessage = msg({
  key: 'lyrics.state_expired',
  value: '⏰ Essa letra expirou. Peça de novo com /lyrics.',
})
const sourceLabel = msg({ key: 'lyrics.source', value: 'fonte: {{source}}' })
const instrumentalMessage = msg({
  key: 'lyrics.instrumental',
  value: '🎼 <b>{{track}}</b> — {{artist}} é uma faixa instrumental.',
})

export const GET_LYRICS_CALLBACK_PATTERN = /^lyr:get:(.+)$/

export interface GetLyricsCallbackDeps {
  tempStateStore: TempStateStore
  getLyrics: GetLyricsUseCase
  /** Quando true, inclui os botões de IA na mensagem da letra. */
  aiEnabled: boolean
}

/**
 * Botão "🧾 Letra" (ex.: no /playingnow): busca a letra da faixa do
 * token e responde com uma NOVA mensagem paginada (a mensagem original
 * permanece intacta).
 */
export function createGetLyricsCallback(deps: GetLyricsCallbackDeps): Composer<FreshBeatContext> {
  const composer = new Composer<FreshBeatContext>()

  composer.callbackQuery(GET_LYRICS_CALLBACK_PATTERN, async (ctx) => {
    await ctx.answerCallbackQuery()

    const token = ctx.match[1]
    if (token === undefined) return
    const track = await deps.tempStateStore.peek<TrackRef>(LYRICS_STATE_NAMESPACE, token)
    if (track === undefined) {
      await ctx.reply(ctx.t(expiredMessage))
      return
    }

    const lyrics = await deps.getLyrics.execute(track)
    if (lyrics.instrumental) {
      await ctx.reply(
        ctx.t(instrumentalMessage, { track: lyrics.trackName, artist: lyrics.artistName }),
        { parse_mode: 'HTML' },
      )
      return
    }

    const keyboard = deps.aiEnabled
      ? await buildAiKeyboard(ctx, deps.tempStateStore, track)
      : undefined
    const footer = lyricsFooter({
      source: ctx.t(sourceLabel, { source: lyrics.source.name }),
    })
    await sendLyricsPages(ctx, {}, lyrics, footer, keyboard)
  })

  return composer
}
