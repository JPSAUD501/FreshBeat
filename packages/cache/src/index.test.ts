import { describe, expect, it } from 'vitest'
import { cacheKey, getOrSet, InMemoryCacheStore, RateLimiter, TempStateStore } from './index.js'

describe('InMemoryCacheStore', () => {
  it('armazena e recupera valores com cópia por JSON', async () => {
    const cache = new InMemoryCacheStore()
    await cache.set('k', { a: 1 })
    const first = await cache.get<{ a: number }>('k')
    first!.a = 999
    const second = await cache.get<{ a: number }>('k')
    expect(second).toEqual({ a: 1 })
  })

  it('expira após o TTL', async () => {
    let now = 1000
    const cache = new InMemoryCacheStore(() => now)
    await cache.set('k', 'v', { ttlSeconds: 10 })
    now += 11_000
    expect(await cache.get('k')).toBeUndefined()
  })

  it('consume retorna uma única vez', async () => {
    const cache = new InMemoryCacheStore()
    await cache.set('k', 'v')
    expect(await cache.consume('k')).toBe('v')
    expect(await cache.consume('k')).toBeUndefined()
  })
})

describe('getOrSet', () => {
  it('chama o loader apenas em cache miss', async () => {
    const cache = new InMemoryCacheStore()
    let calls = 0
    const loader = () => {
      calls++
      return Promise.resolve('value')
    }
    expect(await getOrSet(cache, 'k', 60, loader)).toBe('value')
    expect(await getOrSet(cache, 'k', 60, loader)).toBe('value')
    expect(calls).toBe(1)
  })
})

describe('cacheKey', () => {
  it('normaliza case e espaços', () => {
    expect(cacheKey('lyrics', 'Bohemian   Rhapsody', 'QUEEN')).toBe(
      'lyrics:bohemian rhapsody:queen',
    )
  })
})

describe('RateLimiter', () => {
  it('permite até o limite dentro da janela e bloqueia depois', async () => {
    const now = 1_000_000
    const limiter = new RateLimiter(new InMemoryCacheStore(() => now), () => now)

    expect((await limiter.check('user:1', 2, 60)).allowed).toBe(true)
    expect((await limiter.check('user:1', 2, 60)).allowed).toBe(true)
    const blocked = await limiter.check('user:1', 2, 60)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('reseta na próxima janela', async () => {
    let now = 1_000_000
    const limiter = new RateLimiter(new InMemoryCacheStore(() => now), () => now)
    await limiter.check('user:1', 1, 60)
    expect((await limiter.check('user:1', 1, 60)).allowed).toBe(false)
    now += 61_000
    expect((await limiter.check('user:1', 1, 60)).allowed).toBe(true)
  })
})

describe('TempStateStore', () => {
  it('cria token de uso único com TTL', async () => {
    const now = 0
    const cache = new InMemoryCacheStore(() => now)
    const store = new TempStateStore(cache)

    const token = await store.create('oauth', { userId: 42 }, 300)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)

    expect(await store.peek('oauth', token)).toEqual({ userId: 42 })
    expect(await store.consume('oauth', token)).toEqual({ userId: 42 })
    expect(await store.consume('oauth', token)).toBeUndefined()
  })

  it('tokens diferentes não colidem', async () => {
    const store = new TempStateStore(new InMemoryCacheStore())
    const a = await store.create('oauth', 'a', 60)
    const b = await store.create('oauth', 'b', 60)
    expect(a).not.toBe(b)
  })
})
