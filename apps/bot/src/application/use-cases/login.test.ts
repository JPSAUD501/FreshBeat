import { InMemoryCacheStore, TempStateStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/entities/user.js'
import { LastfmNotLinkedError } from '../../domain/errors/app-error.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'
import {
  LOGIN_STATE_NAMESPACE,
  StartLoginUseCase,
  UnlinkLastfmUseCase,
  requireLastfmLinked,
} from './login.js'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'uuid-1',
    telegramUserId: 42,
    lastfmUsername: null,
    preferredLocale: null,
    telegramLocale: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('StartLoginUseCase', () => {
  it('retorna already_linked quando o usuário já tem Last.fm', async () => {
    const useCase = new StartLoginUseCase(
      new TempStateStore(new InMemoryCacheStore()),
      'https://freshbeat.example',
    )
    const result = await useCase.execute(makeUser({ lastfmUsername: 'ana' }))
    expect(result).toEqual({ status: 'already_linked', lastfmUsername: 'ana' })
  })

  it('cria estado de uso único e monta a URL do site', async () => {
    const cache = new InMemoryCacheStore()
    const useCase = new StartLoginUseCase(new TempStateStore(cache), 'https://freshbeat.example')

    const result = await useCase.execute(makeUser())

    if (result.status !== 'started') throw new Error('unreachable')
    expect(result.url).toMatch(/^https:\/\/freshbeat\.example\/auth\/lastfm\?state=.+$/)
    expect(result.expiresInMinutes).toBe(10)

    // O estado existe e aponta para o usuário certo
    const token = new URL(result.url).searchParams.get('state')!
    const state = await cache.consume<{ telegramUserId: number }>(
      `${LOGIN_STATE_NAMESPACE}:${token}`,
    )
    expect(state).toEqual({ telegramUserId: 42 })
  })
})

describe('UnlinkLastfmUseCase', () => {
  it('desvincula quando há conta vinculada', async () => {
    const unlinkLastfm = vi.fn().mockResolvedValue(undefined)
    const repository: UserRepository = {
      findByTelegramId: vi.fn(),
      create: vi.fn(),
      linkLastfm: vi.fn(),
      unlinkLastfm,
      touchTelegramLocale: vi.fn(),
      setPreferredLocale: vi.fn(),
      delete: vi.fn(),
    }
    const useCase = new UnlinkLastfmUseCase(repository)

    await useCase.execute(makeUser({ lastfmUsername: 'ana' }))

    expect(unlinkLastfm).toHaveBeenCalledWith(42)
  })

  it('lança LastfmNotLinkedError quando não há vínculo', async () => {
    const unlinkLastfm = vi.fn()
    const repository: UserRepository = {
      findByTelegramId: vi.fn(),
      create: vi.fn(),
      linkLastfm: vi.fn(),
      unlinkLastfm,
      touchTelegramLocale: vi.fn(),
      setPreferredLocale: vi.fn(),
      delete: vi.fn(),
    }
    const useCase = new UnlinkLastfmUseCase(repository)

    await expect(useCase.execute(makeUser())).rejects.toBeInstanceOf(LastfmNotLinkedError)
    expect(unlinkLastfm).not.toHaveBeenCalled()
  })
})

describe('requireLastfmLinked', () => {
  it('passa quando há vínculo', () => {
    const user = makeUser({ lastfmUsername: 'ana' })
    requireLastfmLinked(user)
    expect(user.lastfmUsername).toBe('ana')
  })

  it('lança quando não há vínculo', () => {
    expect(() => requireLastfmLinked(makeUser())).toThrow(LastfmNotLinkedError)
  })
})
