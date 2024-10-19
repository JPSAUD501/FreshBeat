import type { userTable } from '../db/schema.ts'

export type DBUser = typeof userTable.$inferSelect
