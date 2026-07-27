import type { FreshBeatContext } from '../context.js'

/**
 * Responde o callback query sem nunca quebrar o fluxo.
 *
 * Em reentregas de update (restart do processo entre o recebimento e a
 * confirmação do offset), a query já foi respondida na "vida anterior"
 * e o Telegram devolve 400 "query is too old". Sem essa proteção o
 * handler morria antes de fazer o trabalho real — agora vira warn e
 * o fluxo segue (o botão fica carregando, mas o resultado chega).
 */
export async function safeAnswerCallbackQuery(ctx: FreshBeatContext, text?: string): Promise<void> {
  try {
    await ctx.answerCallbackQuery(text !== undefined ? { text } : undefined)
  } catch (error) {
    ctx.log.warn({ err: error }, 'answerCallbackQuery falhou (query antiga/reentrega) — seguindo')
  }
}
