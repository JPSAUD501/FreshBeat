import { SUPPORTED_LOCALES } from '@freshbeat/i18n'
import { NextResponse, type NextRequest } from 'next/server'
import { negotiateLocale } from './lib/negotiate-locale'

/**
 * Roteamento por locale: garante o prefixo /{locale} em todas as
 * páginas. Sem prefixo → redireciona para o melhor idioma do
 * Accept-Language (fallback pt-BR).
 * Fluxos (/auth, /api) ficam fora do prefixo — têm roteamento próprio.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const hasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (hasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${negotiateLocale(request.headers.get('accept-language'))}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|auth|.*\\..*).*)'],
}
