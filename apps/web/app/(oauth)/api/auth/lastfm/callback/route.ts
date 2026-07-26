import { NextResponse, type NextRequest } from 'next/server'
import { fetchLastfmSessionUsername } from '../../../../../../lib/lastfm-auth'
import { getConfig, getTempStateStore, getUserRepository } from '../../../../../../lib/server'

interface LoginStatePayload {
  telegramUserId: number
}

function errorRedirect(baseUrl: string, reason: string): NextResponse {
  return NextResponse.redirect(`${baseUrl}/auth/lastfm/error?reason=${reason}`)
}

/**
 * Callback do OAuth Last.fm: troca o token pelo username, consome o
 * estado de uso único (anti-replay) e grava o vínculo no banco —
 * o mesmo repositório que o bot lê nos comandos.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const config = getConfig()
  const baseUrl = config.web.WEB_BASE_URL

  const token = request.nextUrl.searchParams.get('token')
  const state = request.nextUrl.searchParams.get('state')
  if (token === null || state === null) return errorRedirect(baseUrl, 'failed')

  const stored = await getTempStateStore().consume<LoginStatePayload>('login', state)
  if (stored === undefined) return errorRedirect(baseUrl, 'expired')

  const lastfmUsername = await fetchLastfmSessionUsername({
    apiKey: config.lastfm.LASTFM_API_KEY,
    apiSecret: config.lastfm.LASTFM_API_SECRET,
    token,
  })
  if (lastfmUsername === null) return errorRedirect(baseUrl, 'failed')

  await getUserRepository().linkLastfm(stored.telegramUserId, lastfmUsername)
  return NextResponse.redirect(`${baseUrl}/auth/lastfm/success`)
}
