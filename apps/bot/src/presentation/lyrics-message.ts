import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import { InlineKeyboard } from 'grammy'
import type { Lyrics } from '../domain/entities/lyrics.js'
import type { TrackRef } from '../domain/entities/track.js'
import type { FreshBeatContext } from './context.js'
import { escapeHtml, lyricsHeader, paginate } from './formatters/lyrics.formatter.js'

const translateButtonLabel = msg({ key: 'lyrics.translate_button', value: '🌐 Traduzir' })
const explainButtonLabel = msg({ key: 'lyrics.explain_button', value: '✨ Explicar' })

export const LYRICS_STATE_NAMESPACE = 'lyricsctx'
export const LYRICS_STATE_TTL_SECONDS = 60 * 60

/**
 * Botões de IA (traduzir/explicar) compartilham o mesmo token de estado —
 * o contexto (faixa/artista) é o mesmo para todos os fluxos de letra.
 */
export async function buildAiKeyboard(
  ctx: FreshBeatContext,
  tempStateStore: TempStateStore,
  track: TrackRef,
): Promise<InlineKeyboard> {
  const token = await tempStateStore.create(LYRICS_STATE_NAMESPACE, track, LYRICS_STATE_TTL_SECONDS)
  return new InlineKeyboard()
    .text(ctx.t(translateButtonLabel), `lyr:tr:${token}`)
    .text(ctx.t(explainButtonLabel), `lyr:ex:${token}`)
}

export interface LyricsMessageTarget {
  chatId?: number
  /** Quando presente (com chatId), edita essa mensagem; senão envia uma nova. */
  messageId?: number
}

/**
 * Envia a letra paginada: primeira página na mensagem alvo (com header,
 * footer e botões), páginas seguintes como mensagens simples.
 */
export async function sendLyricsPages(
  ctx: FreshBeatContext,
  target: LyricsMessageTarget,
  lyrics: Lyrics,
  footer: string,
  replyMarkup: InlineKeyboard | undefined,
): Promise<void> {
  const header = lyricsHeader(lyrics)
  const [firstPage, ...rest] = paginate(lyrics.plainLyrics)
  const text = `${header}\n\n${escapeHtml(firstPage ?? '')}\n\n${footer}`
  const options = {
    parse_mode: 'HTML' as const,
    ...(replyMarkup !== undefined ? { reply_markup: replyMarkup } : {}),
  }

  if (target.messageId !== undefined && target.chatId !== undefined) {
    await ctx.api.editMessageText(target.chatId, target.messageId, text, options)
  } else {
    await ctx.reply(text, options)
  }

  for (const page of rest) {
    await ctx.reply(escapeHtml(page), { parse_mode: 'HTML' })
  }
}
