import type { User } from '../../domain/entities/user.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'

export interface GetOrCreateUserResult {
  user: User
  /** true quando é o primeiro contato do usuário com o bot. */
  isNew: boolean
}

/**
 * Garante que o usuário existe no banco (cria no primeiro contato).
 * Usado por comandos que precisam do registro do usuário.
 */
export class GetOrCreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(telegramUserId: number): Promise<GetOrCreateUserResult> {
    const existing = await this.userRepository.findByTelegramId(telegramUserId)
    if (existing !== null) return { user: existing, isNew: false }
    return { user: await this.userRepository.create(telegramUserId), isNew: true }
  }
}
