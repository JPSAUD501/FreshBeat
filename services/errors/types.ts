import type { errorTable } from '../db/schema.ts'

export type DBError = typeof errorTable.$inferSelect
