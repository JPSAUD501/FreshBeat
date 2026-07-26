import { headers } from 'next/headers'
import { TELEGRAM_BOT_URL } from '../../../../../lib/env'
import { t } from '../../../../../lib/i18n'
import { negotiateLocale } from '../../../../../lib/negotiate-locale'

/** Página de sucesso do vínculo Last.fm (alvo do callback OAuth). */
export default async function LastfmSuccessPage() {
  const locale = negotiateLocale((await headers()).get('accept-language'))

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md rounded-2xl bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold">{t(locale, 'login.success_title')}</h1>
        <p className="mt-4 text-muted">{t(locale, 'login.success_text')}</p>
        <a
          href={TELEGRAM_BOT_URL}
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2 font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          {t(locale, 'landing.cta')}
        </a>
      </div>
    </main>
  )
}
