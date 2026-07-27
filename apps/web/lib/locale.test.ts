import { describe, expect, it } from 'vitest'
import { resolveWebLocale } from './locale'

describe('resolveWebLocale', () => {
  it('preferredLocale do banco vence tudo', () => {
    expect(
      resolveWebLocale({
        preferredLocale: 'en-US',
        telegramLocale: 'pt-BR',
        acceptLanguage: 'ja-JP,ja;q=0.9',
      }),
    ).toBe('en-US')
  })

  it('telegramLocale é a base quando não há preferência explícita', () => {
    expect(
      resolveWebLocale({
        preferredLocale: null,
        telegramLocale: 'ja-JP',
        acceptLanguage: 'en-US',
      }),
    ).toBe('ja-JP')
  })

  it('normaliza variantes do Telegram (pt-PT vira pt-BR)', () => {
    expect(
      resolveWebLocale({ preferredLocale: null, telegramLocale: 'pt-PT', acceptLanguage: null }),
    ).toBe('pt-BR')
  })

  it('cai no Accept-Language quando o banco não tem nada', () => {
    expect(
      resolveWebLocale({
        preferredLocale: null,
        telegramLocale: null,
        acceptLanguage: 'es-ES,es;q=0.9',
      }),
    ).toBe('es-ES')
  })

  it('trata strings vazias como ausentes', () => {
    expect(
      resolveWebLocale({ preferredLocale: '', telegramLocale: '', acceptLanguage: 'en-US' }),
    ).toBe('en-US')
  })

  it('cai no fallback padrão sem nenhuma pista', () => {
    expect(
      resolveWebLocale({ preferredLocale: null, telegramLocale: null, acceptLanguage: null }),
    ).toBe('pt-BR')
  })
})
