/**
 * Erros de aplicação. Qualquer erro que "faz parte do negócio"
 * (conta não vinculada, letra não encontrada…) deve estender AppError
 * com uma chave i18n, para a camada de apresentação traduzir.
 * Erros inesperados viram /support_error_{id}.
 */
export abstract class AppError extends Error {
  abstract readonly i18nKey: string

  constructor(
    message: string,
    public readonly vars?: Record<string, string | number>,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = new.target.name
  }
}

/** O usuário precisa vincular o Last.fm para usar o recurso. */
export class LastfmNotLinkedError extends AppError {
  readonly i18nKey = 'lastfm.not_linked'
  constructor() {
    super('Usuário sem conta Last.fm vinculada')
  }
}

export class UserNotFoundError extends AppError {
  readonly i18nKey = 'common.error_with_code'
  constructor(public readonly telegramUserId: number) {
    super(`Usuário não encontrado: ${telegramUserId}`)
  }
}

/** Rate limit excedido. */
export class RateLimitedError extends AppError {
  readonly i18nKey = 'common.rate_limited'
  constructor(public readonly retryAfterSeconds: number) {
    super(`Rate limit excedido, tente em ${retryAfterSeconds}s`, {
      seconds: retryAfterSeconds,
    })
  }
}

/** Nenhum provedor encontrou a letra. */
export class LyricsNotFoundError extends AppError {
  readonly i18nKey = 'lyrics.not_found'
  constructor(track: string, artist: string) {
    super(`Letra não encontrada: ${track} — ${artist}`, { track, artist })
  }
}

/** O usuário não está ouvindo nada no momento (Last.fm). */
export class NotListeningError extends AppError {
  readonly i18nKey = 'playingnow.not_listening'
  constructor() {
    super('Nada tocando no momento')
  }
}

/** A faixa atual não tem álbum identificado no Last.fm. */
export class AlbumNotIdentifiedError extends AppError {
  readonly i18nKey = 'pnalbum.no_album'
  constructor() {
    super('Faixa atual sem álbum identificado')
  }
}

/** O usuário do Last.fm não existe (ou a API não o encontrou). */
export class LastfmUserNotFoundError extends AppError {
  readonly i18nKey = 'brief.user_not_found'
  constructor(username: string) {
    super(`Usuário Last.fm não encontrado: ${username}`, { user: username })
  }
}
