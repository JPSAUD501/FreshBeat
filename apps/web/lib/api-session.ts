import type { NextRequest } from 'next/server'
import { getConfig, getUserRepository } from './server'
import { decodeSession, SESSION_COOKIE, type SessionPayload } from './session'

export interface AuthenticatedUser {
  session: SessionPayload
  lastfmUsername: string | null
}

/**
 * Sessão + usuário para rotas /api/me/*.
 * Retorna null quando não autenticado (a rota responde 401).
 */
export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  const config = getConfig()
  const session = decodeSession(
    request.cookies.get(SESSION_COOKIE)?.value,
    config.web.WEB_SESSION_SECRET,
  )
  if (session === null) return null

  const user = await getUserRepository()
    .findByTelegramId(session.telegramUserId)
    .catch(() => null)

  return { session, lastfmUsername: user?.lastfmUsername ?? null }
}
