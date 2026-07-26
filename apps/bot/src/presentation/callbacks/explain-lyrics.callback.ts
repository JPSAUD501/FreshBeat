import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import type { Logger } from '@freshbeat/logging'
import { Composer } from 'grammy'
import type { ExplainLyricsUseCase } from '../../application/use-cases/explain-lyrics.js'
import type { GenerateLyricsImageUseCase } from '../../application/use-cases/generate-lyrics-image.js'
import type { GetLyricsUseCase } from '../../application/use-cases/get-lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { FreshBeatContext } from '../context.js'
import { LYRICS_STATE_NAMESPACE } from '../lyrics-message.js'
import { escapeHtml, lyricsFooter, lyricsHeader } from '../formatters/lyrics.formatter.js'

const explainingLabel = msg({ key: 'lyrics.explaining', value: '✨ Explicando…' })
const expiredMessage = msg({
  key: 'lyrics.state_expired',
  value: '⏰ Essa letra expirou. Peça de novo com /lyrics.',
})
const sourceLabel = msg({ key: 'lyrics.source', value: 'fonte: {{source}}' })
const aiExplanationLabel = msg({ key: 'lyrics.ai_explanation', value: 'explicação por IA' })
const generatingImageLabel = msg({ key: 'image.generating', value: '🎨 Gerando imagem…' })
const imageCaption = msg({ key: 'image.caption', value: '🎨 {{alt}}' })
const imageFailedMessage = msg({
  key: 'image.failed',
  value: '😕 Não consegui gerar a imagem dessa vez.',
})

export const EXPLAIN_CALLBACK_PATTERN = /^lyr:ex:(.+)$/

export interface ExplainCallbackDeps {
  tempStateStore: TempStateStore
  getLyrics: GetLyricsUseCase
  explainLyrics: ExplainLyricsUseCase
  /** Sem Replicate+S3 configurados, só a explicação textual é enviada. */
  generateLyricsImage?: GenerateLyricsImageUseCase
  logger: Logger
}

/**
 * Botão "✨ Explicar": resposta progressiva — responde o callback na
 * hora, edita a mensagem com a explicação e, em seguida, gera a imagem
 * da música (etapa mais lenta) e a envia como foto com alt-text na
 * legenda (acessibilidade, ideia mantida do MelodyScout).
 */
export function createExplainLyricsCallback(deps: ExplainCallbackDeps): Composer<FreshBeatContext> {
  const composer = new Composer<FreshBeatContext>()

  composer.callbackQuery(EXPLAIN_CALLBACK_PATTERN, async (ctx) => {
    await ctx.answerCallbackQuery({ text: ctx.t(explainingLabel) })

    const token = ctx.match[1]
    if (token === undefined) return
    const track = await deps.tempStateStore.peek<TrackRef>(LYRICS_STATE_NAMESPACE, token)
    if (track === undefined) {
      await ctx.reply(ctx.t(expiredMessage))
      return
    }

    const lyrics = await deps.getLyrics.execute(track)
    const { explanation, imagePrompt, altText } = await deps.explainLyrics.execute({
      lyrics,
      locale: ctx.locale,
    })

    // 1) Edita a mensagem da letra com a explicação
    const footer = lyricsFooter({
      source: ctx.t(sourceLabel, { source: lyrics.source.name }),
      autoTranslated: ctx.t(aiExplanationLabel),
    })
    const message = ctx.callbackQuery.message
    if (message !== undefined) {
      await ctx.api.editMessageText(
        message.chat.id,
        message.message_id,
        `${lyricsHeader(lyrics)}\n\n${escapeHtml(explanation)}\n\n${footer}`,
        { parse_mode: 'HTML' },
      )
    }

    // 2) Imagem (etapa lenta): mensagem temporária → foto → apaga a temporária
    if (deps.generateLyricsImage !== undefined) {
      await sendLyricsImage(ctx, deps.generateLyricsImage, deps.logger, {
        lyrics,
        imagePrompt,
        altText,
      })
    }
  })

  return composer
}

async function sendLyricsImage(
  ctx: FreshBeatContext,
  generateLyricsImage: GenerateLyricsImageUseCase,
  logger: Logger,
  input: {
    lyrics: Parameters<GenerateLyricsImageUseCase['execute']>[0]['lyrics']
    imagePrompt: string
    altText: string
  },
): Promise<void> {
  const placeholder = await ctx.reply(ctx.t(generatingImageLabel))
  try {
    const { url } = await generateLyricsImage.execute({
      lyrics: input.lyrics,
      imagePrompt: input.imagePrompt,
    })
    await ctx.replyWithPhoto(url, {
      caption: ctx.t(imageCaption, { alt: input.altText }).slice(0, 1024),
    })
    await ctx.api.deleteMessage(placeholder.chat.id, placeholder.message_id)
  } catch (error) {
    // A explicação já foi entregue — falha na imagem vira mensagem amigável, não /support_error
    logger.error({ err: error }, 'falha ao gerar imagem da letra')
    await ctx.api.editMessageText(
      placeholder.chat.id,
      placeholder.message_id,
      ctx.t(imageFailedMessage),
    )
  }
}
