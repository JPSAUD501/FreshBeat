import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '../../config.ts'

export class DBService {
  readonly db

  constructor() {
    const client = postgres(config.DATABASE_URL, { prepare: false })
    this.db = drizzle(client)
  }
}