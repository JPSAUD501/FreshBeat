import type { Locale } from '@freshbeat/i18n'

/** Usuário do FreshBeat (espelha a tabela `users`, sem detalhes de banco). */
export interface User {
  readonly id: string
  readonly telegramUserId: number
  readonly lastfmUsername: string | null
  readonly preferredLocale: Locale | null
  readonly createdAt: Date
  readonly updatedAt: Date
}
