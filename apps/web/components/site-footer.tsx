import { Headphones } from 'lucide-react'
import Link from 'next/link'
import { GITHUB_URL } from '../lib/env'
import { t, type Locale } from '../lib/i18n'
import { GithubIcon } from './github-icon'

/** Rodapé editorial: marca grande, links legais e GitHub. */
export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 font-display text-3xl tracking-wide uppercase">
              <Headphones className="size-7 text-fb" />
              FreshBeat
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t(locale, 'footer.made_with')}</p>
          </div>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href={`/${locale}/privacy`} className="transition-colors hover:text-foreground">
              {t(locale, 'nav.privacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="transition-colors hover:text-foreground">
              {t(locale, 'nav.terms')}
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
