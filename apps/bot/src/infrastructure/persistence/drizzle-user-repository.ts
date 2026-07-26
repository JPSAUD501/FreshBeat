import { eq } from 'drizzle-orm'
import { users, type Database, type UserRow } from '@freshbeat/database'
import type { Locale } from '@freshbeat/i18n'
import type { User } from '../../domain/entities/user.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'

function toDomain(row: UserRow): User {
  return {
    id: row.id,
    telegramUserId: row.telegramUserId,
    lastfmUsername: row.lastfmUsername,
    preferredLocale: (row.preferredLocale as Locale | null) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByTelegramId(telegramUserId: number): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, telegramUserId))
      .limit(1)
    const row = rows[0]
    return row === undefined ? null : toDomain(row)
  }

  async create(telegramUserId: number): Promise<User> {
    const [row] = await this.db.insert(users).values({ telegramUserId }).returning()
    if (row === undefined) throw new Error('Falha ao criar usuário: insert não retornou linha')
    return toDomain(row)
  }

  async linkLastfm(telegramUserId: number, lastfmUsername: string): Promise<User> {
    const [row] = await this.db
      .update(users)
      .set({ lastfmUsername, updatedAt: new Date() })
      .where(eq(users.telegramUserId, telegramUserId))
      .returning()
    if (row === undefined) {
      throw new Error(`Falha ao vincular Last.fm: usuário ${telegramUserId} não encontrado`)
    }
    return toDomain(row)
  }

  async unlinkLastfm(telegramUserId: number): Promise<void> {
    await this.db
      .update(users)
      .set({ lastfmUsername: null, updatedAt: new Date() })
      .where(eq(users.telegramUserId, telegramUserId))
  }
}
