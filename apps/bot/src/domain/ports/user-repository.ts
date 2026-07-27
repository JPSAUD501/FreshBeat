import type { User } from '../entities/user.js'

/** Port de persistência de usuários. */
export interface UserRepository {
  findByTelegramId(telegramUserId: number): Promise<User | null>
  create(telegramUserId: number): Promise<User>
  linkLastfm(telegramUserId: number, lastfmUsername: string): Promise<User>
  unlinkLastfm(telegramUserId: number): Promise<void>
  /** Atualiza o idioma detectado pelo Telegram (quando muda). */
  touchTelegramLocale(telegramUserId: number, telegramLocale: string): Promise<void>
  /** Define (ou limpa, com null) a preferência explícita de idioma. */
  setPreferredLocale(telegramUserId: number, preferredLocale: string | null): Promise<void>
  /** Apaga o usuário e todos os dados associados. */
  delete(telegramUserId: number): Promise<void>
}
