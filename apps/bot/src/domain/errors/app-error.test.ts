import { describe, expect, it } from 'vitest'
import {
  AlbumNotIdentifiedError,
  type AppError,
  LastfmNotLinkedError,
  LastfmUserNotFoundError,
  LyricsNotFoundError,
  NotListeningError,
  RateLimitedError,
  UserNotFoundError,
} from './app-error.js'

describe('AppError', () => {
  it('todo erro de negócio tem chave i18n e nome da classe', () => {
    const errors: AppError[] = [
      new LastfmNotLinkedError(),
      new UserNotFoundError(42),
      new RateLimitedError(30),
      new LyricsNotFoundError(),
      new NotListeningError(),
      new AlbumNotIdentifiedError(),
      new LastfmUserNotFoundError('ghost'),
    ]
    for (const error of errors) {
      expect(error.i18nKey).toBeTruthy()
      expect(error.name).toBe(error.constructor.name)
      expect(error.message).toBeTruthy()
    }
  })

  it('UserNotFoundError carrega o telegramUserId', () => {
    const error = new UserNotFoundError(42)
    expect(error.telegramUserId).toBe(42)
    expect(error.i18nKey).toBe('common.error_with_code')
  })

  it('RateLimitedError expõe os segundos para a mensagem traduzida', () => {
    const error = new RateLimitedError(30)
    expect(error.retryAfterSeconds).toBe(30)
    expect(error.vars).toEqual({ seconds: 30 })
    expect(error.i18nKey).toBe('common.rate_limited')
  })

  it('LastfmUserNotFoundError menciona o usuário na mensagem', () => {
    const error = new LastfmUserNotFoundError('ghost')
    expect(error.message).toContain('ghost')
    expect(error.i18nKey).toBe('brief.user_not_found')
  })
})
