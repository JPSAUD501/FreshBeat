import type { Logger } from '@freshbeat/logging'
import type { BotError } from 'grammy'
import { describe, expect, it, vi } from 'vitest'
import { LastfmNotLinkedError } from '../domain/errors/app-error.js'
import type { FreshBeatContext } from './context.js'
import { createErrorHandler } from './error-handler.js'

function makeLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  }
}

function makeBotError(
  error: unknown,
  ctxOverrides: Record<string, unknown> = {},
): { botError: BotError<FreshBeatContext>; replies: string[] } {
  const replies: string[] = []
  const ctx = {
    from: { id: 42, language_code: 'pt' },
    update: { update_id: 1 },
    reply: (text: string) => {
      replies.push(text)
      return Promise.resolve()
    },
    ...ctxOverrides,
  } as unknown as FreshBeatContext
  return { botError: { ctx, error } as unknown as BotError<FreshBeatContext>, replies }
}

describe('createErrorHandler', () => {
  it('AppError responde a mensagem traduzida e loga warn', async () => {
    const logger = makeLogger()
    const handler = createErrorHandler({ logger: logger as unknown as Logger })
    const { botError, replies } = makeBotError(new LastfmNotLinkedError())

    await handler(botError)
    expect(logger.warn).toHaveBeenCalledOnce()
    expect(replies).toHaveLength(1)
    expect(replies[0]).not.toContain('req_')
  })

  it('erro inesperado responde só com o requestId e loga error', async () => {
    const logger = makeLogger()
    const ctxLog = makeLogger()
    const handler = createErrorHandler({ logger: logger as unknown as Logger })
    const requestId = '12345678-abcd-4000-8000-abcdefabcdef'
    const { botError, replies } = makeBotError(new Error('db exploded'), {
      requestId,
      log: ctxLog,
      locale: 'pt-BR',
    })

    await handler(botError)
    expect(replies).toHaveLength(1)
    expect(replies[0]).toContain('req_12345678')
    expect(replies[0]).not.toContain('db exploded')
    expect(replies[0]).not.toContain('/support_error')
    expect(ctxLog.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'unexpected error',
    )
  })

  it('sem middleware de observabilidade cai no logger raiz com req_unknown', async () => {
    const logger = makeLogger()
    const handler = createErrorHandler({ logger: logger as unknown as Logger })
    const { botError, replies } = makeBotError(new Error('early boom'))

    await handler(botError)
    expect(replies[0]).toContain('req_unknown')
    expect(logger.error).toHaveBeenCalledOnce()
  })

  it('falha ao responder não propaga (usuário já pode ter bloqueado o bot)', async () => {
    const logger = makeLogger()
    const handler = createErrorHandler({ logger: logger as unknown as Logger })
    const ctx = {
      from: { id: 42 },
      update: { update_id: 1 },
      reply: () => Promise.reject(new Error('blocked by user')),
    } as unknown as FreshBeatContext

    await expect(
      handler({ ctx, error: new Error('boom') } as unknown as BotError<FreshBeatContext>),
    ).resolves.toBeUndefined()
  })
})
