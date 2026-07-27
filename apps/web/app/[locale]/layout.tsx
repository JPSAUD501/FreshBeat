import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../../components/language-switcher'
import { Toaster } from '../../components/ui/sonner'
import { isLocale, SUPPORTED_LOCALES, t, type Locale } from '../../lib/i18n'
import '../globals.css'

// Display condensado (títulos gigantes, estilo editorial) + corpo legível.
// ja-JP cai para a stack CJK do sistema definida em --font-display/--font-sans.
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
    description: t(locale, 'landing.hero_subtitle'),
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
    <html lang={locale} className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <header className="border-b border-surface">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
            <Link href={`/${locale}`} className="text-lg font-bold">
              🎧 FreshBeat
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm text-muted hover:text-foreground"
              >
                {t(locale, 'nav.dashboard')}
              </Link>
              <LanguageSwitcher current={locale} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4">{children}</main>

        <footer className="border-t border-surface">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted">
            <span>{t(locale, 'footer.made_with')}</span>
            <span className="flex gap-4">
              <Link href={`/${locale}/privacy`} className="hover:text-foreground">
                {t(locale, 'nav.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-foreground">
                {t(locale, 'nav.terms')}
              </Link>
            </span>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
