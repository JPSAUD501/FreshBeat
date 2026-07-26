import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  extractVars,
  getCatalog,
  lang,
  msg,
  normalizeLocale,
  resolveUserLocale,
} from './index.js'

describe('paridade entre idiomas', () => {
  const base = getCatalog(DEFAULT_LOCALE)
  const baseKeys = Object.keys(base).sort()

  it.each(SUPPORTED_LOCALES)('%s tem exatamente as mesmas chaves da base pt-BR', (locale) => {
    const catalog = getCatalog(locale)
    expect(Object.keys(catalog).sort()).toEqual(baseKeys)
  })

  it.each(SUPPORTED_LOCALES)('%s usa os mesmos placeholders da base em cada mensagem', (locale) => {
    const catalog = getCatalog(locale)
    for (const key of baseKeys) {
      const baseVars = extractVars(base[key]!).sort()
      const localeVars = extractVars(catalog[key]!).sort()
      expect(localeVars, `placeholders divergentes em "${key}" (${locale})`).toEqual(baseVars)
    }
  })

  it.each(SUPPORTED_LOCALES)('%s não tem mensagens vazias', (locale) => {
    const catalog = getCatalog(locale)
    for (const [key, value] of Object.entries(catalog)) {
      expect(value.trim().length, `mensagem vazia: ${key} (${locale})`).toBeGreaterThan(0)
    }
  })
})

describe('lang', () => {
  const descriptor = msg({ key: 'start.welcome', value: 'Olá, {{name}}!' })

  it('resolve no idioma solicitado', () => {
    expect(lang('en-US', descriptor, { name: 'Ana' })).toContain('Ana')
    expect(lang('en-US', descriptor, { name: 'Ana' })).toContain('Hi')
  })

  it('interpola variáveis', () => {
    const text = lang('pt-BR', msg({ key: 'common.rate_limited', value: '' }), { seconds: 30 })
    expect(text).toContain('30')
  })

  it('mantém placeholder quando a variável não é fornecida', () => {
    const text = lang('pt-BR', msg({ key: 'common.rate_limited', value: '' }))
    expect(text).toContain('{{seconds}}')
  })

  it('cai no valor padrão inline para chave desconhecida', () => {
    const fallback = lang('pt-BR', msg({ key: 'chave.inexistente', value: 'padrão {{x}}' }), {
      x: '1',
    })
    expect(fallback).toBe('padrão 1')
  })
})

describe('normalizeLocale', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['en', 'en-US'],
    ['en-GB', 'en-US'],
    ['ja', 'ja-JP'],
    ['es', 'es-ES'],
    ['es-MX', 'es-ES'],
    ['fr', 'pt-BR'],
    [undefined, 'pt-BR'],
    ['', 'pt-BR'],
  ] as const)('%s → %s', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected)
  })
})

describe('resolveUserLocale', () => {
  it('preferência salva vence a detecção do Telegram', () => {
    expect(resolveUserLocale('en-US', 'pt-BR')).toBe('en-US')
  })

  it('sem preferência, usa o idioma do Telegram', () => {
    expect(resolveUserLocale(null, 'ja')).toBe('ja-JP')
  })

  it('preferência inválida cai na detecção', () => {
    expect(resolveUserLocale('xx-YY', 'es')).toBe('es-ES')
  })
})
