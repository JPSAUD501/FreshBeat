import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { negotiateLocale } from '../../lib/negotiate-locale'
import '../globals.css'

/**
 * Root layout do grupo (oauth): páginas do fluxo de vínculo Last.fm
 * (/auth/lastfm/*) ficam fora do prefixo /{locale} porque são alvos de
 * redirect do bot e do Last.fm. O idioma vem do Accept-Language.
 */
export default async function OAuthLayout({ children }: { children: ReactNode }) {
  const locale = negotiateLocale((await headers()).get('accept-language'))
  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  )
}
