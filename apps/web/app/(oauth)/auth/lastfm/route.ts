import { NextResponse, type NextRequest } from 'next/server'
import { buildLastfmAuthUrl } from '../../../../lib/lastfm-auth'
import { getConfig, getTempStateStore } from '../../../../lib/server'

interface LoginStatePayload {
  telegramUserId: number
}

function errorRedirect(baseUrl: string, reason: string): NextResponse {
  return NextResponse.redirect(`${baseUrl}/auth/lastfm/error?reason=${reason}`)
}

/**
 * Início do vínculo Last.fm. O bot cria o estado (Redis, uso único) e
 * manda o usuário para cá (/auth/lastfm?state=...). Validamos o estado
 * e redirecionamos para a autorização do Last.fm. O estado só é
 * consumido no callback — se o usuário abandonar o fluxo, pode voltar
 * pelo mesmo link dentro do TTL.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const config = getConfig()
  const baseUrl = config.web.WEB_BASE_URL

  const state = request.nextUrl.searchParams.get('state')
  if (state === null) return errorRedirect(baseUrl, 'expired')

  const stored = await getTempStateStore().peek<LoginStatePayload>('login', state)
  if (stored === undefined) return errorRedirect(baseUrl, 'expired')

  const callbackUrl = `${baseUrl}/api/auth/lastfm/callback?state=${encodeURIComponent(state)}`
  return NextResponse.redirect(buildLastfmAuthUrl(config.lastfm.LASTFM_API_KEY, callbackUrl))
}
