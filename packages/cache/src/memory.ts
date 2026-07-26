import type { CacheStore } from './port.js'

interface Entry {
  raw: string
  expiresAt: number | undefined
}

/**
 * Cache em memória com a mesma interface do Redis — usado em testes
 * e como fallback de desenvolvimento. Serializa em JSON para manter
 * a mesma semântica de cópia do Redis.
 */
export class InMemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, Entry>()

  constructor(private readonly now: () => number = Date.now) {}

  get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key)
    if (entry === undefined) return Promise.resolve(undefined)
    if (entry.expiresAt !== undefined && entry.expiresAt <= this.now()) {
      this.store.delete(key)
      return Promise.resolve(undefined)
    }
    return Promise.resolve(JSON.parse(entry.raw) as T)
  }

  set<T>(key: string, value: T, options?: { ttlSeconds?: number }): Promise<void> {
    this.store.set(key, {
      raw: JSON.stringify(value),
      expiresAt:
        options?.ttlSeconds !== undefined ? this.now() + options.ttlSeconds * 1000 : undefined,
    })
    return Promise.resolve()
  }

  delete(key: string): Promise<void> {
    this.store.delete(key)
    return Promise.resolve()
  }

  async consume<T>(key: string): Promise<T | undefined> {
    const value = await this.get<T>(key)
    this.store.delete(key)
    return value
  }

  /** Apenas para testes: quantidade de chaves vivas. */
  size(): number {
    return this.store.size
  }
}
