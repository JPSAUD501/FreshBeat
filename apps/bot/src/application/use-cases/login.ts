import type { TempStateStore } from '@freshbeat/cache'
import type { User } from '../../domain/entities/user.js'
import { LastfmNotLinkedError } from '../../domain/errors/app-error.js'
import type { UserRepository } from '../../domain/ports/user-repository.js'

export const LOGIN_STATE_NAMESPACE = 'login'
/** O link de conexão expira em 10 minutos. */
export const LOGIN_STATE_TTL_SECONDS = 10 * 60

export type LoginFlowResult =
  | { status: 'already_linked'; lastfmUsername: string }
  | { status: 'started'; url: string; expiresInMinutes: number }

/**
 * Inicia o fluxo de vínculo com o Last.fm: cria um estado temporário
 * de uso único e monta a URL do site que conduz o OAuth do Last.fm.
 * Sem sleeps nem polling — o site consome o estado e grava o vínculo.
 */
export class StartLoginUseCase {
  constructor(
    private readonly tempStateStore: TempStateStore,
    private readonly webBaseUrl: string,
  ) {}

  async execute(user: User): Promise<LoginFlowResult> {
    if (user.lastfmUsername !== null) {
      return { status: 'already_linked', lastfmUsername: user.lastfmUsername }
    }

    const token = await this.tempStateStore.create(
      LOGIN_STATE_NAMESPACE,
      { telegramUserId: user.telegramUserId },
      LOGIN_STATE_TTL_SECONDS,
    )

    return {
      status: 'started',
      url: `${this.webBaseUrl}/auth/lastfm?state=${token}`,
      expiresInMinutes: LOGIN_STATE_TTL_SECONDS / 60,
    }
  }
}

/** Desvincula o Last.fm. Erro de negócio se não houver vínculo. */
export class UnlinkLastfmUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    if (user.lastfmUsername === null) throw new LastfmNotLinkedError()
    await this.userRepository.unlinkLastfm(user.telegramUserId)
  }
}

/**
 * Exige usuário com Last.fm vinculado — atalho usado pelos
 * comandos que dependem de scrobbles.
 */
export function requireLastfmLinked(user: User): asserts user is User & {
  lastfmUsername: string
} {
  if (user.lastfmUsername === null) throw new LastfmNotLinkedError()
}

/** Apaga a conta e todos os dados do usuário (/forgetme e exclusão pelo site). */
export class DeleteAccountUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    await this.userRepository.delete(user.telegramUserId)
  }
}
