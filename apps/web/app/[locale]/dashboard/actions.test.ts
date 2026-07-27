import { beforeEach, describe, expect, it, vi } from 'vitest'
import { encodeSession, newSessionPayload, SESSION_COOKIE } from '../../../lib/session'

const SECRET = 'test-secret'

const mocks = vi.hoisted(() => {
  return {
    cookieValue: undefined as string | undefined,
    cookieDelete: vi.fn(),
    unlinkLastfm: vi.fn<(id: number) => Promise<void>>().mockResolvedValue(),
    setPreferredLocale: vi
      .fn<(id: number, locale: string | null) => Promise<void>>()
      .mockResolvedValue(),
    deleteUser: vi.fn<(id: number) => Promise<void>>().mockResolvedValue(),
    tempStateCreate: vi.fn<() => Promise<string>>().mockResolvedValue('state-token-123'),
  }
})

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === SESSION_COOKIE && mocks.cookieValue !== undefined
        ? { value: mocks.cookieValue }
        : undefined,
    delete: mocks.cookieDelete,
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

vi.mock('../../../lib/server', () => ({
  getConfig: () => ({
    web: { WEB_SESSION_SECRET: SECRET, WEB_BASE_URL: 'https://freshbeat.example' },
  }),
  getUserRepository: () => ({
    unlinkLastfm: mocks.unlinkLastfm,
    setPreferredLocale: mocks.setPreferredLocale,
    delete: mocks.deleteUser,
  }),
  getTempStateStore: () => ({
    create: mocks.tempStateCreate,
  }),
}))

const {
  deleteAccountAction,
  logoutAction,
  setPreferredLocaleAction,
  startLastfmLinkAction,
  unlinkLastfmAction,
} = await import('./actions')

function signIn(telegramUserId = 42): void {
  mocks.cookieValue = encodeSession(newSessionPayload(telegramUserId, 'Ana'), SECRET)
}

beforeEach(() => {
  mocks.cookieValue = undefined
  vi.clearAllMocks()
})

describe('requireSession', () => {
  it('sem cookie redireciona para o dashboard do locale', async () => {
    await expect(unlinkLastfmAction('pt-BR')).rejects.toThrow('NEXT_REDIRECT:/pt-BR/dashboard')
    expect(mocks.unlinkLastfm).not.toHaveBeenCalled()
  })

  it('cookie adulterado também redireciona', async () => {
    mocks.cookieValue = 'lixo.invalido'
    await expect(unlinkLastfmAction('en-US')).rejects.toThrow('NEXT_REDIRECT:/en-US/dashboard')
    expect(mocks.unlinkLastfm).not.toHaveBeenCalled()
  })
})

describe('unlinkLastfmAction', () => {
  it('desvincula o usuário da sessão', async () => {
    signIn(777)
    await expect(unlinkLastfmAction('pt-BR')).resolves.toEqual({ ok: true })
    expect(mocks.unlinkLastfm).toHaveBeenCalledWith(777)
  })
})

describe('setPreferredLocaleAction', () => {
  it('salva locale suportado e o retorna como efetivo', async () => {
    signIn()
    await expect(setPreferredLocaleAction('pt-BR', 'ja-JP')).resolves.toEqual({
      ok: true,
      effectiveLocale: 'ja-JP',
    })
    expect(mocks.setPreferredLocale).toHaveBeenCalledWith(42, 'ja-JP')
  })

  it("'auto' limpa a preferência e o efetivo é o locale atual", async () => {
    signIn()
    await expect(setPreferredLocaleAction('en-US', 'auto')).resolves.toEqual({
      ok: true,
      effectiveLocale: 'en-US',
    })
    expect(mocks.setPreferredLocale).toHaveBeenCalledWith(42, null)
  })

  it('valor inválido limpa a preferência (defesa)', async () => {
    signIn()
    await setPreferredLocaleAction('pt-BR', 'fr-FR')
    expect(mocks.setPreferredLocale).toHaveBeenCalledWith(42, null)
  })
})

describe('startLastfmLinkAction', () => {
  it('cria estado de uso único com o usuário da sessão e entra no OAuth', async () => {
    signIn(555)
    await expect(startLastfmLinkAction('pt-BR')).rejects.toThrow(
      'NEXT_REDIRECT:https://freshbeat.example/auth/lastfm?state=state-token-123',
    )
    expect(mocks.tempStateCreate).toHaveBeenCalledWith(
      'login',
      { telegramUserId: 555, origin: 'web' },
      600,
    )
  })
})

describe('deleteAccountAction', () => {
  it('apaga o usuário, limpa o cookie e redireciona para a despedida', async () => {
    signIn(888)
    await expect(deleteAccountAction('pt-BR')).rejects.toThrow(
      'NEXT_REDIRECT:/pt-BR/dashboard?goodbye=1',
    )
    expect(mocks.deleteUser).toHaveBeenCalledWith(888)
    expect(mocks.cookieDelete).toHaveBeenCalledWith(SESSION_COOKIE)
  })
})

describe('logoutAction', () => {
  it('limpa o cookie e volta para o dashboard', async () => {
    signIn()
    await expect(logoutAction('ja-JP')).rejects.toThrow('NEXT_REDIRECT:/ja-JP/dashboard')
    expect(mocks.cookieDelete).toHaveBeenCalledWith(SESSION_COOKIE)
    expect(mocks.deleteUser).not.toHaveBeenCalled()
  })
})
