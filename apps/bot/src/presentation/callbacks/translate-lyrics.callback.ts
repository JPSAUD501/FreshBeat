import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetLyricsUseCase } from '../../application/use-cases/get-lyrics.js'
import type { TranslateLyricsUseCase } from '../../application/use-cases/translate-lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { FreshBeatContext } from '../context.js'
import { LYRICS_STATE_NAMESPACE } from '../commands/lyrics.command.js'
import { escapeHtml, lyricsFooter, lyricsHeader, paginate } from '../formatters/lyrics.formatter.js'

const translatingLabel = msg({ key: 'lyrics.translating', value: '🌐 Traduzindo…' })
const expiredMessage = msg({
  key: 'lyrics.state_expired',
  value: '⏰ Essa letra expirou. Peça de novo com /lyrics.',
})
const sourceLabel = msg({ key: 'lyrics.source', value: 'fonte: {{source}}' })
const autoTranslatedLabel = msg({
  key: 'lyrics.auto_translated',
  value: 'tradução automática',
})

export const TRANSLATE_CALLBACK_PATTERN = /^lyr:tr:(.+)$/

export interface TranslateCallbackDeps {
  tempStateStore: TempStateStore
  getLyrics: GetLyricsUseCase
  translateLyrics: TranslateLyricsUseCase
}

/**
 * Botão "🌐 Traduzir": o callback_data carrega só um token — o
 * contexto (faixa/artista) fica no Redis, respeitando o limite de
 * 64 bytes do Telegram sem hacks de truncamento.
 */
export function createTranslateLyricsCallback(
  deps: TranslateCallbackDeps,
): Composer<FreshBeatContext> {
  const composer = new Composer<FreshBeatContext>()

  composer.callbackQuery(TRANSLATE_CALLBACK_PATTERN, async (ctx) => {
    await ctx.answerCallbackQuery({ text: ctx.t(translatingLabel) })

    const token = ctx.match[1]
    if (token === undefined) return
    const track = await deps.tempStateStore.peek<TrackRef>(LYRICS_STATE_NAMESPACE, token)
    if (track === undefined) {
      await ctx.reply(ctx.t(expiredMessage))
      return
    }

    const lyrics = await deps.getLyrics.execute(track)
    const translated = await deps.translateLyrics.execute({
      lyrics,
      targetLocale: ctx.locale,
    })

    const footer = lyricsFooter({
      source: ctx.t(sourceLabel, { source: lyrics.source.name }),
      autoTranslated: ctx.t(autoTranslatedLabel),
    })
    const [firstPage, ...rest] = paginate(translated)

    const message = ctx.callbackQuery.message
    if (message !== undefined) {
      await ctx.api.editMessageText(
        message.chat.id,
        message.message_id,
        `${lyricsHeader(lyrics)}\n\n${escapeHtml(firstPage ?? '')}\n\n${footer}`,
        { parse_mode: 'HTML' },
      )
    }
    for (const page of rest) {
      await ctx.reply(escapeHtml(page), { parse_mode: 'HTML' })
    }
  })

  return composer
}
