import type { RateLimiter } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import type { MiddlewareFn } from 'grammy'
import type { FreshBeatContext } from '../context.js'

const rateLimitedMessage = msg({
  key: 'common.rate_limited',
  value: '🐌 Calma aí! Tente de novo em {{seconds}}s.',
})

export interface RateLimitRule {
  /** Quantas ações por janela. */
  limit: number
  windowSeconds: number
}

const DEFAULT_RULE: RateLimitRule = { limit: 20, windowSeconds: 60 }

/**
 * Rate limit por usuário do Telegram. A resposta de "calma aí"
 * também é limitada para não gerar spam de respostas.
 */
export function createRateLimitMiddleware(
  rateLimiter: RateLimiter,
  rule: RateLimitRule = DEFAULT_RULE,
): MiddlewareFn<FreshBeatContext> {
  return async (ctx, next) => {
    const userId = ctx.from?.id
    if (userId === undefined) {
      await next()
      return
    }

    const result = await rateLimiter.check(`user:${userId}`, rule.limit, rule.windowSeconds)
    if (!result.allowed) {
      // Só avisa 1x por janela para não spammar
      const warnKey = `warned:${userId}`
      const warnResult = await rateLimiter.check(warnKey, 1, rule.windowSeconds)
      if (warnResult.allowed) {
        await ctx.reply(ctx.t(rateLimitedMessage, { seconds: result.retryAfterSeconds }))
      }
      return
    }

    await next()
  }
}
