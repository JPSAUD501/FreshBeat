import { randomUUID } from 'node:crypto'
import type { Logger } from '@freshbeat/logging'
import type { MiddlewareFn } from 'grammy'
import type { FreshBeatContext } from '../context.js'

function describeUpdate(ctx: FreshBeatContext): string {
  const text = ctx.message?.text
  if (text !== undefined) return `message:${text.split(' ')[0] ?? ''}`
  if (ctx.callbackQuery !== undefined) return `callback:${ctx.callbackQuery.data ?? ''}`
  return `update:${ctx.update.update_id}`
}

/**
 * PRIMEIRO middleware da cadeia — toda interação ganha um `requestId`
 * (UUID) e um logger filho com os bindings do request. Todo log
 * downstream (interação, erro) carrega o mesmo requestId, e é esse
 * código que o usuário recebe quando algo quebra.
 */
export function createObservabilityMiddleware(logger: Logger): MiddlewareFn<FreshBeatContext> {
  return async (ctx, next) => {
    const startedAt = performance.now()
    ctx.requestId = randomUUID()
    ctx.log = logger.child({
      requestId: ctx.requestId,
      interaction: describeUpdate(ctx),
      telegramUserId: ctx.from?.id,
    })

    try {
      await next()
      ctx.log.info(
        { locale: ctx.locale, durationMs: Math.round(performance.now() - startedAt) },
        'interaction handled',
      )
    } catch (error) {
      ctx.log.warn(
        { err: error, durationMs: Math.round(performance.now() - startedAt) },
        'interaction failed',
      )
      throw error
    }
  }
}
