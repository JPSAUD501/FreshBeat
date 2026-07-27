'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SUPPORTED_LOCALES, type Locale } from '../lib/i18n'

const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'ja-JP': 'JA',
  'es-ES': 'ES',
}

/** Troca o prefixo de locale do path atual. */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Language" className="flex gap-1 text-sm">
      {SUPPORTED_LOCALES.map((locale) => (
        <Link
          key={locale}
          href={pathname.replace(`/${current}`, `/${locale}`)}
          aria-current={locale === current ? 'true' : undefined}
          className={
            locale === current
              ? 'rounded px-2 py-1 font-semibold text-fb'
              : 'rounded px-2 py-1 text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </nav>
  )
}
