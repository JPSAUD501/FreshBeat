import { NextResponse, type NextRequest } from 'next/server'
import { negotiateLocale } from '../../../../../../lib/negotiate-locale'
import { getConfig } from '../../../../../../lib/server'
import {
  encodeSession,
  newSessionPayload,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '../../../../../../lib/session'
import { validateTelegramLogin } from '../../../../../../lib/telegram-auth'

/**
 * Callback do Telegram Login Widget: valida a assinatura HMAC dos
 * dados, cria a sessão (cookie httpOnly) e manda para o dashboard.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const config = getConfig()
  const locale = negotiateLocale(request.headers.get('accept-language'))
  const dashboardUrl = (suffix: string) => `${config.web.WEB_BASE_URL}/${locale}/dashboard${suffix}`

  const data: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    data[key] = value
  })

  const profile = validateTelegramLogin(data, config.telegram.BOT_TOKEN)
  if (profile === null) {
    return NextResponse.redirect(dashboardUrl('?error=login'))
  }

  const response = NextResponse.redirect(dashboardUrl(''))
  response.cookies.set(
    SESSION_COOKIE,
    encodeSession(
      newSessionPayload(profile.telegramUserId, profile.firstName),
      config.web.WEB_SESSION_SECRET,
    ),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.web.WEB_BASE_URL.startsWith('https:'),
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    },
  )
  return response
}
