import type { Logger } from '@freshbeat/logging'
import type { MiddlewareFn } from 'grammy'
import type { FreshBeatContext } from '../context.js'

function describeUpdate(ctx: FreshBeatContext): string {
  const text = ctx.message?.text
  if (text !== undefined) return `message:${text.split(' ')[0] ?? ''}`
  if (ctx.callbackQuery !== undefined) return `callback:${ctx.callbackQuery.data ?? ''}`
  return `update:${ctx.update.update_id}`
}

/** Loga cada interação (sem conteúdo sensível) com duração. */
export function createInteractionLogMiddleware(logger: Logger): MiddlewareFn<FreshBeatContext> {
  return async (ctx, next) => {
    const startedAt = performance.now()
    const interaction = describeUpdate(ctx)
    try {
      await next()
      logger.info(
        {
          interaction,
          telegramUserId: ctx.from?.id,
          locale: ctx.locale,
          durationMs: Math.round(performance.now() - startedAt),
        },
        'interaction handled',
      )
    } catch (error) {
      logger.warn({ interaction, telegramUserId: ctx.from?.id, err: error }, 'interaction failed')
      throw error
    }
  }
}
