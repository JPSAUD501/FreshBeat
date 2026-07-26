import { eq } from 'drizzle-orm'
import { users, type UserRow } from './schema.js'
import type { Database } from './index.js'

/** Usuário de domínio compartilhado entre bot e site. */
export interface FreshBeatUser {
  readonly id: string
  readonly telegramUserId: number
  readonly lastfmUsername: string | null
  readonly preferredLocale: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

function toDomain(row: UserRow): FreshBeatUser {
  return {
    id: row.id,
    telegramUserId: row.telegramUserId,
    lastfmUsername: row.lastfmUsername,
    preferredLocale: row.preferredLocale,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/**
 * Repositório de usuários compartilhado (bot e site).
 * O bot o usa através do port UserRepository (mesma forma estrutural).
 */
export class DrizzleUserRepository {
  constructor(private readonly db: Database) {}

  async findByTelegramId(telegramUserId: number): Promise<FreshBeatUser | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, telegramUserId))
      .limit(1)
    const row = rows[0]
    return row === undefined ? null : toDomain(row)
  }

  async create(telegramUserId: number): Promise<FreshBeatUser> {
    const [row] = await this.db.insert(users).values({ telegramUserId }).returning()
    if (row === undefined) throw new Error('Falha ao criar usuário: insert não retornou linha')
    return toDomain(row)
  }

  async linkLastfm(telegramUserId: number, lastfmUsername: string): Promise<FreshBeatUser> {
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
