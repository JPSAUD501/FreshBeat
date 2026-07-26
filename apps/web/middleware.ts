import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@freshbeat/i18n'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Roteamento por locale: garante o prefixo /{locale} em todas as
 * páginas. Sem prefixo → redireciona para o melhor idioma do
 * Accept-Language (fallback pt-BR).
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

function negotiateLocale(header: string | null): string {
  if (!header) return DEFAULT_LOCALE
  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: (tag ?? '').toLowerCase(), q: q !== undefined ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of candidates) {
    const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === tag)
    if (exact) return exact
    const prefix = tag.split('-')[0]
    const byPrefix = SUPPORTED_LOCALES.find((locale) =>
      locale.toLowerCase().startsWith(`${prefix}-`),
    )
    if (byPrefix) return byPrefix
  }
  return DEFAULT_LOCALE
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
