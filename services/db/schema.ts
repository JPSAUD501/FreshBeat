import { bigint, date, integer, pgTable, varchar } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bio: varchar({ length: 255 }),
  telegram_id: bigint({ mode: 'number' }).notNull(),
  lastfm_username: varchar({ length: 255 }),
  lastfm_session_key: varchar({ length: 255 }),
  created_at: date().notNull().default('now()'),
  updated_at: date().notNull().default('now()').defaultNow().$onUpdateFn(() => 'now()'),
})

export const errorTable = pgTable('error', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  composer: varchar({ length: 255 }),
  ctx: varchar({ length: 5000 }).notNull(),
  error: varchar({ length: 5000 }).notNull(),
  created_at: date().notNull().default('now()'),
})
