import { bigint, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * Usuários do bot. Um registro por usuário do Telegram.
 * O locale preferido sobrescreve a detecção automática pelo Telegram.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    telegramUserId: bigint('telegram_user_id', { mode: 'number' }).notNull().unique(),
    lastfmUsername: varchar('lastfm_username', { length: 64 }),
    preferredLocale: varchar('preferred_locale', { length: 10 }),
    /** Idioma detectado pelo Telegram (language_code) — base da preferência. */
    telegramLocale: varchar('telegram_locale', { length: 10 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('users_lastfm_username_idx').on(table.lastfmUsername)],
)

/**
 * Log de erros apresentados ao usuário como /support_error_{id}.
 * Guardamos só o necessário para investigar — nunca payloads inteiros
 * de contexto (que podem conter dados pessoais).
 */
export const errorLogs = pgTable('error_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  telegramUserId: bigint('telegram_user_id', { mode: 'number' }),
  /** Identificador curto da origem, ex.: "command:playingnow". */
  source: varchar('source', { length: 128 }).notNull(),
  errorName: varchar('error_name', { length: 128 }).notNull(),
  errorMessage: text('error_message').notNull(),
  errorStack: text('error_stack'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
export type ErrorLogRow = typeof errorLogs.$inferSelect
export type NewErrorLogRow = typeof errorLogs.$inferInsert
