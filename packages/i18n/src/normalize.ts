import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './types.js'

/**
 * Converte o `language_code` do Telegram (ex.: "pt-BR", "en", "ja",
 * "es-ES", "pt-PT") para um Locale suportado, com fallback pt-BR.
 */
export function normalizeLocale(languageCode: string | undefined | null): Locale {
  if (languageCode === undefined || languageCode === null || languageCode === '') {
    return DEFAULT_LOCALE
  }

  const lower = languageCode.toLowerCase()

  // Match exato primeiro (ex.: pt-br, en-us)
  for (const locale of SUPPORTED_LOCALES) {
    if (locale.toLowerCase() === lower) return locale
  }

  // Depois pelo prefixo do idioma (ex.: "en" → en-US, "pt" → pt-BR)
  const [language] = lower.split('-')
  const byLanguage: Record<string, Locale> = {
    pt: 'pt-BR',
    en: 'en-US',
    ja: 'ja-JP',
    es: 'es-ES',
  }
  return (language !== undefined ? byLanguage[language] : undefined) ?? DEFAULT_LOCALE
}

/**
 * Resolve o locale efetivo do usuário: preferência salva no banco
 * (se existir) vence a detecção do Telegram.
 */
export function resolveUserLocale(
  preferredLocale: string | null | undefined,
  telegramLanguageCode: string | undefined | null,
): Locale {
  if (preferredLocale !== null && preferredLocale !== undefined && preferredLocale !== '') {
    const exact = SUPPORTED_LOCALES.find(
      (locale) => locale.toLowerCase() === preferredLocale.toLowerCase(),
    )
    if (exact !== undefined) return exact
  }
  return normalizeLocale(telegramLanguageCode)
}
