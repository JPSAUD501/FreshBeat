import { createHmac, timingSafeEqual } from 'node:crypto'

export interface SessionPayload {
  telegramUserId: number
  firstName: string
  /** Expiração em unix seconds. */
  exp: number
}

export const SESSION_COOKIE = 'fb_session'
/** Sessão do dashboard dura 30 dias. */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url')
}

/**
 * Cookie de sessão stateless: base64url(JSON) + '.' + HMAC-SHA256.
 * Não guarda nada sensível — só o ID do Telegram e o primeiro nome.
 */
export function encodeSession(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${body}.${sign(body, secret)}`
}

export function decodeSession(
  cookie: string | undefined,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): SessionPayload | null {
  if (cookie === undefined) return null
  const [body, signature] = cookie.split('.')
  if (body === undefined || signature === undefined) return null

  const expected = sign(body, secret)
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (typeof payload.telegramUserId !== 'number' || typeof payload.exp !== 'number') return null
    if (payload.exp <= nowSeconds) return null
    return payload
  } catch {
    return null
  }
}

/** Monta o payload de uma sessão nova (exp = agora + maxAge). */
export function newSessionPayload(telegramUserId: number, firstName: string): SessionPayload {
  return {
    telegramUserId,
    firstName,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  }
}
