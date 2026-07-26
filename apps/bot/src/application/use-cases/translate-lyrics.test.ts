import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { AiTextGenerator } from '../../domain/ports/ai-text.js'
import { TranslateLyricsUseCase } from './translate-lyrics.js'

function makeLyrics(plainLyrics = 'Is this the real life?'): Lyrics {
  return {
    trackName: 'Bohemian Rhapsody',
    artistName: 'Queen',
    plainLyrics,
    syncedLyrics: null,
    instrumental: false,
    source: { id: 'lrclib', name: 'LRCLIB' },
  }
}

function makeAi(result = 'Será que isso é a vida real?'): AiTextGenerator & {
  calls: { systemPrompt: string; userPrompt: string }[]
} {
  const calls: { systemPrompt: string; userPrompt: string }[] = []
  return {
    calls,
    generate: vi.fn().mockImplementation((input: { systemPrompt: string; userPrompt: string }) => {
      calls.push(input)
      return Promise.resolve(result)
    }),
  }
}

describe('TranslateLyricsUseCase', () => {
  it('traduz para o idioma alvo via IA', async () => {
    const ai = makeAi()
    const useCase = new TranslateLyricsUseCase(ai, new InMemoryCacheStore())

    const translated = await useCase.execute({ lyrics: makeLyrics(), targetLocale: 'pt-BR' })

    expect(translated).toBe('Será que isso é a vida real?')
    expect(ai.calls[0]?.userPrompt).toContain('Brazilian Portuguese')
    expect(ai.calls[0]?.userPrompt).toContain('Is this the real life?')
  })

  it('cacheia traduções por faixa e idioma', async () => {
    const ai = makeAi()
    const useCase = new TranslateLyricsUseCase(ai, new InMemoryCacheStore())

    await useCase.execute({ lyrics: makeLyrics(), targetLocale: 'pt-BR' })
    await useCase.execute({ lyrics: makeLyrics(), targetLocale: 'pt-BR' })
    await useCase.execute({ lyrics: makeLyrics(), targetLocale: 'ja-JP' })

    expect(ai.calls).toHaveLength(2)
  })

  it('trunca letras gigantescas', async () => {
    const ai = makeAi()
    const useCase = new TranslateLyricsUseCase(ai, new InMemoryCacheStore())

    await useCase.execute({ lyrics: makeLyrics('x'.repeat(20_000)), targetLocale: 'en-US' })

    expect(ai.calls[0]?.userPrompt.length).toBeLessThan(9000)
  })
})
