import { bigint, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

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

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
