import type { Locale } from '@freshbeat/i18n'

/** Nome do idioma em inglês, para instruir LLMs sobre a língua da resposta. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Brazilian Portuguese',
  'en-US': 'English',
  'ja-JP': 'Japanese',
  'es-ES': 'Spanish',
}
