import { describe, expect, it } from 'vitest'
import {
  AlbumNotIdentifiedError,
  type AppError,
  LastfmNotLinkedError,
  LastfmUserNotFoundError,
  LyricsNotFoundError,
  NotListeningError,
  RateLimitedError,
} from './app-error.js'

describe('AppError', () => {
  it('todo erro de negócio tem chave i18n e nome da classe', () => {
    const errors: AppError[] = [
      new LastfmNotLinkedError(),
      new RateLimitedError(30),
      new LyricsNotFoundError('Bohemian Rhapsody', 'Queen'),
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

  it('RateLimitedError expõe os segundos para a mensagem traduzida', () => {
    const error = new RateLimitedError(30)
    expect(error.retryAfterSeconds).toBe(30)
    expect(error.vars).toEqual({ seconds: 30 })
    expect(error.i18nKey).toBe('common.rate_limited')
  })

  it('LyricsNotFoundError carrega faixa e artista para a mensagem traduzida', () => {
    const error = new LyricsNotFoundError('Bohemian Rhapsody', 'Queen')
    expect(error.vars).toEqual({ track: 'Bohemian Rhapsody', artist: 'Queen' })
    expect(error.i18nKey).toBe('lyrics.not_found')
  })

  it('LastfmUserNotFoundError menciona o usuário na mensagem', () => {
    const error = new LastfmUserNotFoundError('ghost')
    expect(error.message).toContain('ghost')
    expect(error.i18nKey).toBe('brief.user_not_found')
  })
})
