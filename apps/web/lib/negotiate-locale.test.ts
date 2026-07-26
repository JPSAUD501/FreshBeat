import { describe, expect, it } from 'vitest'
import { negotiateLocale } from './negotiate-locale'

describe('negotiateLocale', () => {
  it('retorna pt-BR sem header', () => {
    expect(negotiateLocale(null)).toBe('pt-BR')
  })

  it('casa locale exato', () => {
    expect(negotiateLocale('en-US,en;q=0.9')).toBe('en-US')
    expect(negotiateLocale('ja-JP')).toBe('ja-JP')
  })

  it('casa por prefixo quando só vem o idioma', () => {
    expect(negotiateLocale('ja')).toBe('ja-JP')
    expect(negotiateLocale('es')).toBe('es-ES')
    expect(negotiateLocale('pt')).toBe('pt-BR')
  })

  it('respeita o q-value', () => {
    expect(negotiateLocale('en-US;q=0.5,es-ES;q=0.9')).toBe('es-ES')
  })

  it('cai no fallback para idiomas não suportados', () => {
    expect(negotiateLocale('fr-FR,fr;q=0.9')).toBe('pt-BR')
  })

  it('tenta o próximo candidato quando o primeiro não é suportado', () => {
    expect(negotiateLocale('fr-FR,en-US;q=0.8')).toBe('en-US')
  })
})
