import { bigint, date, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

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
  uuid: uuid().notNull().default(sql`uuid_generate_v4()`),
  composer: varchar({ length: 255 }),
  ctx: varchar({ length: 5000 }).notNull(),
  error: varchar({ length: 5000 }).notNull(),
  created_at: date().notNull().default('now()'),
})

export const keyvalueTable = pgTable('key_value', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: varchar({ length: 255 }).notNull().unique(),
  value: varchar({ length: 5000 }).notNull(),
})
