import type { Logger } from '@freshbeat/logging'
import { describe, expect, it, vi } from 'vitest'
import type { FreshBeatContext } from '../context.js'
import { createObservabilityMiddleware } from './observability.middleware.js'

function makeLogger() {
  const child = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
  const root = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => child as unknown as Logger),
  }
  return { root: root as unknown as Logger, rootMocks: root, childMocks: child }
}

function makeContext(overrides: Record<string, unknown> = {}): FreshBeatContext {
  return {
    from: { id: 42 },
    message: { text: '/playingnow' },
    update: { update_id: 1 },
    ...overrides,
  } as unknown as FreshBeatContext
}

describe('createObservabilityMiddleware', () => {
  it('gera requestId (uuid) e logger filho com os bindings do request', async () => {
    const { root, rootMocks } = makeLogger()
    const middleware = createObservabilityMiddleware(root)
    const ctx = makeContext()

    await middleware(ctx, () => {
      expect(ctx.requestId).toMatch(/^[0-9a-f-]{36}$/)
      expect(rootMocks.child).toHaveBeenCalledWith({
        requestId: ctx.requestId,
        interaction: 'message:/playingnow',
        telegramUserId: 42,
      })
      expect(ctx.log).toBeDefined()
      return Promise.resolve()
    })
  })

  it('loga a interação com duração no sucesso', async () => {
    const { root, childMocks } = makeLogger()
    const middleware = createObservabilityMiddleware(root)
    const ctx = makeContext()

    await middleware(ctx, () => Promise.resolve())
    expect(childMocks.info).toHaveBeenCalledWith(
      expect.objectContaining({ durationMs: expect.any(Number) }),
      'interaction handled',
    )
  })

  it('loga a falha e re-lança o erro', async () => {
    const { root, childMocks } = makeLogger()
    const middleware = createObservabilityMiddleware(root)
    const ctx = makeContext()
    const boom = new Error('boom')

    await expect(
      middleware(ctx, () => {
        throw boom
      }),
    ).rejects.toThrow('boom')
    expect(childMocks.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: boom }),
      'interaction failed',
    )
  })

  it('descreve callbacks pelo data', async () => {
    const { root, rootMocks } = makeLogger()
    const middleware = createObservabilityMiddleware(root)
    const ctx = makeContext({ message: undefined, callbackQuery: { data: 'lyrics:abc' } })

    await middleware(ctx, () => Promise.resolve())
    expect(rootMocks.child).toHaveBeenCalledWith(
      expect.objectContaining({ interaction: 'callback:lyrics:abc' }),
    )
  })
})
