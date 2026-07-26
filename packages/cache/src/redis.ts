import { Redis } from 'ioredis'
import type { CacheStore } from './port.js'

export class RedisCacheStore implements CacheStore {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.redis.get(key)
    if (raw === null) return undefined
    return JSON.parse(raw) as T
  }

  async set<T>(key: string, value: T, options?: { ttlSeconds?: number }): Promise<void> {
    const raw = JSON.stringify(value)
    if (options?.ttlSeconds !== undefined) {
      await this.redis.set(key, raw, 'EX', options.ttlSeconds)
    } else {
      await this.redis.set(key, raw)
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async consume<T>(key: string): Promise<T | undefined> {
    const raw = await this.redis.getdel(key)
    if (raw === null) return undefined
    return JSON.parse(raw) as T
  }
}

export function createRedisClient(url: string): Redis {
  return new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  })
}
