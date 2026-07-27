'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SUPPORTED_LOCALES, type Locale } from '../lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const LOCALE_SHORT: Record<Locale, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'ja-JP': 'JA',
  'es-ES': 'ES',
}

/** Nomes nativos dos idiomas (não se traduzem). */
const LOCALE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Português (BR)',
  'en-US': 'English (US)',
  'ja-JP': '日本語',
  'es-ES': 'Español',
}

/** Troca o prefixo de locale do path atual — dropdown com nomes nativos. */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Language"
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:border-fb/40 hover:text-foreground data-[state=open]:border-fb/40 data-[state=open]:text-foreground"
      >
        <Globe className="size-4" />
        <span className="font-semibold">{LOCALE_SHORT[current]}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language / Idioma</DropdownMenuLabel>
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link
              href={pathname.replace(`/${current}`, `/${locale}`)}
              aria-current={locale === current ? 'true' : undefined}
              className="flex w-full items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-7 font-mono text-xs text-muted-foreground">
                  {LOCALE_SHORT[locale]}
                </span>
                {LOCALE_NAMES[locale]}
              </span>
              {locale === current && <Check className="size-4 text-fb" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
