import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import { GenerateLyricsImageUseCase } from './generate-lyrics-image.js'

const lyrics: Lyrics = {
  trackName: 'Bohemian Rhapsody',
  artistName: 'Queen',
  plainLyrics: 'Is this the real life?',
  syncedLyrics: null,
  instrumental: false,
  source: { id: 'lrclib', name: 'LRCLIB' },
}

function makeGenerator(bytes = new Uint8Array([1, 2, 3])) {
  return {
    generate: vi.fn().mockResolvedValue({ bytes, contentType: 'image/jpeg' }),
  }
}

function makeStorage() {
  const uploads: { key: string; contentType: string }[] = []
  const upload = vi.fn((input: { key: string; contentType: string }) => {
    uploads.push(input)
    return Promise.resolve(`https://cdn.example.com/${input.key}`)
  })
  return { uploads, upload }
}

describe('GenerateLyricsImageUseCase', () => {
  it('gera a imagem, faz upload e retorna a URL pública', async () => {
    const generator = makeGenerator()
    const storage = makeStorage()
    const useCase = new GenerateLyricsImageUseCase(generator, storage, new InMemoryCacheStore())

    const result = await useCase.execute({ lyrics, imagePrompt: 'A surreal desert' })

    expect(generator.generate).toHaveBeenCalledWith({ prompt: 'A surreal desert' })
    expect(result.url).toBe(`https://cdn.example.com/${storage.uploads[0]?.key}`)
  })

  it('nomeia o objeto com slug da faixa + hash (estável e único)', async () => {
    const storage = makeStorage()
    const useCase = new GenerateLyricsImageUseCase(
      makeGenerator(),
      storage,
      new InMemoryCacheStore(),
    )

    await useCase.execute({ lyrics, imagePrompt: 'x' })

    expect(storage.uploads[0]?.key).toMatch(/^lyrics\/queen-bohemian-rhapsody-[0-9a-f]{12}\.jpg$/)
  })

  it('usa extensão .png quando o gerador retorna PNG', async () => {
    const generator = makeGenerator()
    generator.generate.mockResolvedValue({ bytes: new Uint8Array([1]), contentType: 'image/png' })
    const storage = makeStorage()
    const useCase = new GenerateLyricsImageUseCase(generator, storage, new InMemoryCacheStore())

    await useCase.execute({ lyrics, imagePrompt: 'x' })

    expect(storage.uploads[0]?.key).toMatch(/\.png$/)
    expect(storage.uploads[0]?.contentType).toBe('image/png')
  })

  it('cacheia a URL — segunda chamada não gera nem faz upload', async () => {
    const generator = makeGenerator()
    const storage = makeStorage()
    const useCase = new GenerateLyricsImageUseCase(generator, storage, new InMemoryCacheStore())

    const first = await useCase.execute({ lyrics, imagePrompt: 'x' })
    const second = await useCase.execute({ lyrics, imagePrompt: 'x' })

    expect(second.url).toBe(first.url)
    expect(generator.generate).toHaveBeenCalledTimes(1)
    expect(storage.upload).toHaveBeenCalledTimes(1)
  })
})
