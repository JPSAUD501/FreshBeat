import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/entities/user.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'
import { GetOrCreateUserUseCase } from './get-or-create-user.js'

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

function makeRepository(overrides: Partial<UserRepository> = {}) {
  const mocks = {
    findByTelegramId: vi.fn<(id: number) => Promise<User | null>>().mockResolvedValue(null),
    create: vi.fn<(id: number) => Promise<User>>().mockResolvedValue(makeUser()),
    linkLastfm: vi.fn(),
    unlinkLastfm: vi.fn(),
    touchTelegramLocale: vi.fn(),
    setPreferredLocale: vi.fn(),
    delete: vi.fn(),
  }
  const repository: UserRepository = { ...mocks, ...overrides }
  return { repository, mocks }
}

describe('GetOrCreateUserUseCase', () => {
  it('retorna usuário existente sem criar', async () => {
    const existing = makeUser({ lastfmUsername: 'ana' })
    const { repository, mocks } = makeRepository({
      findByTelegramId: vi.fn().mockResolvedValue(existing),
    })
    const useCase = new GetOrCreateUserUseCase(repository)

    const result = await useCase.execute(42)

    expect(result.user).toBe(existing)
    expect(result.isNew).toBe(false)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('cria usuário no primeiro contato', async () => {
    const { repository, mocks } = makeRepository()
    const useCase = new GetOrCreateUserUseCase(repository)

    const result = await useCase.execute(42)

    expect(result.isNew).toBe(true)
    expect(mocks.create).toHaveBeenCalledWith(42)
  })
})
