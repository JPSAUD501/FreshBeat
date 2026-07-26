import type { CacheStore } from './port.js'

export interface RateLimitResult {
  allowed: boolean
  /** Segundos até o limite resetar (0 quando permitido). */
  retryAfterSeconds: number
}

/**
 * Rate limiter de janela fixa sobre o CacheStore.
 * Conta por chave composta (ex.: userId + ação) dentro da janela.
 */
export class RateLimiter {
  constructor(
    private readonly cache: CacheStore,
    private readonly now: () => number = Date.now,
  ) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const windowStart = Math.floor(this.now() / (windowSeconds * 1000))
    const counterKey = `ratelimit:${key}:${windowStart}`
    const ttlSeconds = windowSeconds

    const current = (await this.cache.get<number>(counterKey)) ?? 0
    if (current >= limit) {
      const windowEndsAt = (windowStart + 1) * windowSeconds * 1000
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((windowEndsAt - this.now()) / 1000)),
      }
    }

    await this.cache.set(counterKey, current + 1, { ttlSeconds })
    return { allowed: true, retryAfterSeconds: 0 }
  }
}
