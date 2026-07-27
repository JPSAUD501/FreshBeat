import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { NoiseOverlay } from '../../components/motion/noise-overlay'
import { SiteFooter } from '../../components/site-footer'
import { SiteHeader } from '../../components/site-header'
import { SmoothScroll } from '../../components/smooth-scroll'
import { Toaster } from '../../components/ui/sonner'
import { TELEGRAM_BOT_URL } from '../../lib/env'
import { fontVariables } from '../../lib/fonts'
import { isLocale, SUPPORTED_LOCALES, t, type Locale } from '../../lib/i18n'
import '../globals.css'

interface LocaleParams {
  params: Promise<{ locale: string }>
}

export function generateStaticParams(): { locale: Locale }[] {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'pt-BR'
  return {
    title: 'FreshBeat',
    description: t(locale, 'landing.hero_manifesto'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col font-sans">
        <SmoothScroll />
        <SiteHeader
          locale={locale}
          dashboardLabel={t(locale, 'nav.dashboard')}
          ctaLabel={t(locale, 'landing.cta')}
          botUrl={TELEGRAM_BOT_URL}
        />
        {/* pt compensa o header fixo nas páginas internas; a landing tem hero full-screen */}
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
        <NoiseOverlay />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
