import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

export type Database = PostgresJsDatabase<typeof schema>

export interface DatabaseConnection {
  db: Database
  /** Encerra o pool — chamar no shutdown gracioso. */
  close: () => Promise<void>
}

/**
 * Cria a conexão com o Postgres. Uma única instância por processo —
 * o composition root de cada app é responsável por criar e compartilhar.
 */
export function createDatabase(databaseUrl: string): DatabaseConnection {
  const client = postgres(databaseUrl, {
    max: 10,
    // Falha rápido em vez de pendurar requests quando o banco cai
    connect_timeout: 10,
  })
  const db = drizzle(client, { schema })
  return {
    db,
    close: async () => {
      await client.end()
    },
  }
}

export { schema }
export * from './schema.js'
