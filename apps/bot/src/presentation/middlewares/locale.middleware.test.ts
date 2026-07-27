import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/entities/user.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'
import type { FreshBeatContext } from '../context.js'
import { createLocaleMiddleware } from './locale.middleware.js'

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

function makeRepository(user: User | null) {
  const mocks = {
    findByTelegramId: vi.fn<(id: number) => Promise<User | null>>().mockResolvedValue(user),
    create: vi.fn(),
    linkLastfm: vi.fn(),
    unlinkLastfm: vi.fn(),
    touchTelegramLocale: vi.fn<(id: number, locale: string) => Promise<void>>().mockResolvedValue(),
    setPreferredLocale: vi.fn(),
    delete: vi.fn(),
  }
  const repository: UserRepository = { ...mocks }
  return { repository, mocks }
}

interface TelegramFrom {
  id: number
  language_code?: string
}

async function run(repository: UserRepository, from: TelegramFrom | undefined) {
  const middleware = createLocaleMiddleware(repository)
  const ctx = { from } as FreshBeatContext
  let called = false
  const next = (): Promise<void> => {
    called = true
    return Promise.resolve()
  }
  await middleware(ctx, next)
  expect(called).toBe(true)
  return ctx
}

describe('createLocaleMiddleware', () => {
  it('preferredLocale do banco sobrepõe o idioma do Telegram', async () => {
    const { repository, mocks } = makeRepository(makeUser({ preferredLocale: 'en-US' }))
    const ctx = await run(repository, { id: 42, language_code: 'pt' })
    expect(ctx.locale).toBe('en-US')
    expect(mocks.touchTelegramLocale).not.toHaveBeenCalled()
  })

  it('usa o language_code do Telegram quando não há preferência', async () => {
    const { repository } = makeRepository(makeUser({ telegramLocale: 'ja' }))
    const ctx = await run(repository, { id: 42, language_code: 'ja' })
    expect(ctx.locale).toBe('ja-JP')
  })

  it('persiste o idioma do Telegram quando muda (fire-and-forget)', async () => {
    const { repository, mocks } = makeRepository(makeUser({ telegramLocale: 'en' }))
    await run(repository, { id: 42, language_code: 'es' })
    expect(mocks.touchTelegramLocale).toHaveBeenCalledWith(42, 'es')
  })

  it('não persiste quando o idioma já está igual', async () => {
    const { repository, mocks } = makeRepository(makeUser({ telegramLocale: 'pt' }))
    await run(repository, { id: 42, language_code: 'pt' })
    expect(mocks.touchTelegramLocale).not.toHaveBeenCalled()
  })

  it('não persiste quando há preferência explícita', async () => {
    const { repository, mocks } = makeRepository(
      makeUser({ preferredLocale: 'es-ES', telegramLocale: 'en' }),
    )
    await run(repository, { id: 42, language_code: 'pt' })
    expect(mocks.touchTelegramLocale).not.toHaveBeenCalled()
  })

  it('usuário novo (não encontrado) resolve só pelo Telegram', async () => {
    const { repository, mocks } = makeRepository(null)
    const ctx = await run(repository, { id: 42, language_code: 'es' })
    expect(ctx.locale).toBe('es-ES')
    expect(mocks.touchTelegramLocale).not.toHaveBeenCalled()
  })

  it('sem from (ex.: channel post) cai no locale padrão e não quebra', async () => {
    const { repository } = makeRepository(null)
    const ctx = await run(repository, undefined)
    expect(ctx.locale).toBe('pt-BR')
  })

  it('falha ao persistir idioma não quebra o comando', async () => {
    const { repository, mocks } = makeRepository(makeUser({ telegramLocale: 'en' }))
    mocks.touchTelegramLocale.mockRejectedValue(new Error('db down'))
    const ctx = await run(repository, { id: 42, language_code: 'pt' })
    expect(ctx.locale).toBe('pt-BR')
  })

  it('expõe ctx.t traduzindo no locale resolvido', async () => {
    const { repository } = makeRepository(makeUser({ preferredLocale: 'en-US' }))
    const ctx = await run(repository, { id: 42, language_code: 'pt' })
    expect(typeof ctx.t).toBe('function')
  })
})
