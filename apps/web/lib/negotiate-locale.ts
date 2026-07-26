import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@freshbeat/i18n'

/** Melhor idioma para um header Accept-Language (fallback pt-BR). */
export function negotiateLocale(header: string | null): Locale {
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
