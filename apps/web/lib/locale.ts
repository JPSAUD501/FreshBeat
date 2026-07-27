import { normalizeLocale, type Locale } from '@freshbeat/i18n'
import { negotiateLocale } from './negotiate-locale'

interface ResolveWebLocaleOptions {
  /** Preferência explícita salva no banco (site/dashboard) — vence tudo. */
  preferredLocale?: string | null
  /** Idioma detectado pelo bot a partir do Telegram (language_code). */
  telegramLocale?: string | null
  /** Header Accept-Language da requisição (último fallback). */
  acceptLanguage?: string | null
}

/**
 * Locale do site para um usuário:
 * `preferredLocale` (banco, explícita) → `telegramLocale` (banco, detectada
 * pelo bot) → Accept-Language do navegador.
 */
export function resolveWebLocale({
  preferredLocale,
  telegramLocale,
  acceptLanguage,
}: ResolveWebLocaleOptions): Locale {
  if (preferredLocale !== undefined && preferredLocale !== null && preferredLocale !== '') {
    return normalizeLocale(preferredLocale)
  }
  if (telegramLocale !== undefined && telegramLocale !== null && telegramLocale !== '') {
    return normalizeLocale(telegramLocale)
  }
  return negotiateLocale(acceptLanguage ?? null)
}
