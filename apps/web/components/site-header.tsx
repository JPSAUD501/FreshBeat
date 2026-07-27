'use client'

import { Headphones } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { LanguageSwitcher } from './language-switcher'
import type { Locale } from '../lib/i18n'

interface SiteHeaderProps {
  locale: Locale
  dashboardLabel: string
  ctaLabel: string
  botUrl: string
}

/** Header fixo: transparente no topo, vidro fosco (blur) ao rolar. */
export function SiteHeader({ locale, dashboardLabel, ctaLabel, botUrl }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled ? 'glass border-b border-border' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-display text-xl tracking-wide uppercase"
        >
          <Headphones className="size-5 text-fb" />
          FreshBeat
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href={`/${locale}/dashboard`}
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {dashboardLabel}
          </Link>
          <LanguageSwitcher current={locale} />
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-fb-hover"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  )
}
