import { headers } from 'next/headers'
import { TELEGRAM_BOT_URL } from '../../../../../lib/env'
import { t } from '../../../../../lib/i18n'
import { negotiateLocale } from '../../../../../lib/negotiate-locale'

/** Página de erro do vínculo Last.fm (estado expirado ou falha na troca). */
export default async function LastfmErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const locale = negotiateLocale((await headers()).get('accept-language'))
  const { reason } = await searchParams
  const messageKey = reason === 'expired' ? 'login.expired' : 'login.lastfm_error'

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="font-display text-3xl tracking-tight uppercase">😕</h1>
        <p className="mt-4 text-muted-foreground">{t(locale, messageKey)}</p>
        <a
          href={TELEGRAM_BOT_URL}
          className="mt-6 inline-block rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground transition-colors hover:bg-fb-hover"
        >
          {t(locale, 'landing.cta')}
        </a>
      </div>
    </main>
  )
}
