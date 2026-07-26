import type { User } from '../entities/user.js'

/** Port de persistência de usuários. */
export interface UserRepository {
  findByTelegramId(telegramUserId: number): Promise<User | null>
  create(telegramUserId: number): Promise<User>
  linkLastfm(telegramUserId: number, lastfmUsername: string): Promise<User>
  unlinkLastfm(telegramUserId: number): Promise<void>
}
