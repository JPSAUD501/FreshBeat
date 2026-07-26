import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import { ExplainLyricsUseCase, stripLrcTags } from './explain-lyrics.js'

const lyrics: Lyrics = {
  trackName: 'Bohemian Rhapsody',
  artistName: 'Queen',
  plainLyrics: 'Is this the real life?\nIs this just fantasy?',
  syncedLyrics: null,
  instrumental: false,
  source: { id: 'lrclib', name: 'LRCLIB' },
}

function makeGenerator(result: string) {
  const calls: { systemPrompt: string; userPrompt: string }[] = []
  const generate = vi.fn((input: { systemPrompt: string; userPrompt: string }) => {
    calls.push(input)
    return Promise.resolve(result)
  })
  return { calls, generate }
}

function makeGenerators() {
  const imageDescriber = makeGenerator('A surreal desert with a fallen crown, oil painting')
  const explainer = makeGenerator('Uma ópera rock sobre culpa e redenção 🎭🎸')
  const altTextWriter = makeGenerator('Um deserto surreal com uma coroa caída na areia.')
  return { imageDescriber, explainer, altTextWriter }
}

describe('ExplainLyricsUseCase', () => {
  it('gera explicação, prompt de imagem e alt-text', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())

    const result = await useCase.execute({ lyrics, locale: 'pt-BR' })

    expect(result.explanation).toContain('ópera rock')
    expect(result.imagePrompt).toContain('desert')
    expect(result.altText).toContain('deserto surreal')
  })

  it('pede a explicação e o alt-text no idioma do usuário', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())

    await useCase.execute({ lyrics, locale: 'ja-JP' })

    expect(generators.explainer.calls[0]?.systemPrompt).toContain('Japanese')
    expect(generators.altTextWriter.calls[0]?.systemPrompt).toContain('Japanese')
    // Prompt de imagem é sempre em inglês (modelos de imagem respondem melhor)
    expect(generators.imageDescriber.calls[0]?.systemPrompt).toContain('English')
  })

  it('envia a letra (sem timestamps LRC) e a faixa no prompt', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())
    const synced: Lyrics = {
      ...lyrics,
      plainLyrics: '[00:01.00] Is this the real life?\n[00:05.30] Is this just fantasy?',
    }

    await useCase.execute({ lyrics: synced, locale: 'en-US' })

    const userPrompt = generators.imageDescriber.calls[0]?.userPrompt ?? ''
    expect(userPrompt).toContain('Bohemian Rhapsody')
    expect(userPrompt).toContain('Queen')
    expect(userPrompt).toContain('Is this the real life?')
    expect(userPrompt).not.toContain('[00:01.00]')
  })

  it('enriquece a explicação com a visão da imagem', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())

    await useCase.execute({ lyrics, locale: 'pt-BR' })

    expect(generators.explainer.calls[0]?.userPrompt).toContain('fallen crown')
  })

  it('cacheia o resultado — segunda chamada não chama a IA', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())

    await useCase.execute({ lyrics, locale: 'pt-BR' })
    await useCase.execute({ lyrics, locale: 'pt-BR' })

    expect(generators.imageDescriber.generate).toHaveBeenCalledTimes(1)
    expect(generators.explainer.generate).toHaveBeenCalledTimes(1)
    expect(generators.altTextWriter.generate).toHaveBeenCalledTimes(1)
  })

  it('cacheia por idioma — idiomas diferentes geram explicações diferentes', async () => {
    const generators = makeGenerators()
    const useCase = new ExplainLyricsUseCase(generators, new InMemoryCacheStore())

    await useCase.execute({ lyrics, locale: 'pt-BR' })
    await useCase.execute({ lyrics, locale: 'es-ES' })

    expect(generators.explainer.generate).toHaveBeenCalledTimes(2)
  })
})

describe('stripLrcTags', () => {
  it('remove timestamps LRC', () => {
    expect(stripLrcTags('[00:01.00] Hello\n[01:23.45] World')).toBe('Hello\nWorld')
  })

  it('colapsa linhas vazias em excesso após a remoção', () => {
    expect(stripLrcTags('A\n[00:02.00]\n\n\nB')).toBe('A\n\nB')
  })

  it('não altera texto sem tags', () => {
    expect(stripLrcTags('Hello\nWorld')).toBe('Hello\nWorld')
  })
})
