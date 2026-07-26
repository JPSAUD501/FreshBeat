import { errorLogs, type Database } from '@freshbeat/database'
import type { ErrorLogEntry, ErrorLogRepository } from '../../domain/ports/error-log-repository.js'

/** Limite para não estourar a coluna e não vazar payloads gigantes. */
const MAX_MESSAGE_LENGTH = 1000
const MAX_STACK_LENGTH = 4000

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`
}

export class DrizzleErrorLogRepository implements ErrorLogRepository {
  constructor(private readonly db: Database) {}

  async log(entry: ErrorLogEntry): Promise<string> {
    const [row] = await this.db
      .insert(errorLogs)
      .values({
        telegramUserId: entry.telegramUserId,
        source: truncate(entry.source, 128),
        errorName: truncate(entry.error.name, 128),
        errorMessage: truncate(entry.error.message, MAX_MESSAGE_LENGTH),
        errorStack:
          entry.error.stack !== undefined ? truncate(entry.error.stack, MAX_STACK_LENGTH) : null,
      })
      .returning({ id: errorLogs.id })
    if (row === undefined) throw new Error('Falha ao registrar erro: insert não retornou linha')
    return row.id
  }
}
