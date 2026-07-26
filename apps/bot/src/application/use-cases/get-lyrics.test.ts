import { InMemoryCacheStore } from '@freshbeat/cache'
import { createSilentLogger } from '@freshbeat/logging'
import { describe, expect, it, vi } from 'vitest'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import { LyricsNotFoundError } from '../../domain/errors/app-error.js'
import type { LyricsProvider } from '../../domain/ports/lyrics-provider.js'
import { GetLyricsUseCase, pickBest } from './get-lyrics.js'

const track: TrackRef = { name: 'Bohemian Rhapsody', artist: 'Queen' }

function makeLyrics(overrides: Partial<Lyrics> = {}): Lyrics {
  return {
    trackName: 'Bohemian Rhapsody',
    artistName: 'Queen',
    plainLyrics: 'Is this the real life?...',
    syncedLyrics: null,
    instrumental: false,
    source: { id: 'fake', name: 'Fake' },
    ...overrides,
  }
}

function makeProvider(id: string, result: Lyrics | null | Error) {
  const searchMock = vi.fn().mockImplementation(() => {
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
  const provider: LyricsProvider = { source: { id, name: id }, search: searchMock }
  return { provider, searchMock }
}

function makeUseCase(
  primary: LyricsProvider[],
  fallback: LyricsProvider,
  cache = new InMemoryCacheStore(),
) {
  return new GetLyricsUseCase({ primary, fallback }, cache, createSilentLogger())
}

describe('GetLyricsUseCase', () => {
  it('prefere resultado sincronizado entre os primários', async () => {
    const plain = makeLyrics({ source: { id: 'lrcmux', name: 'lrcmux' } })
    const synced = makeLyrics({
      syncedLyrics: '[00:01.00] Is this the real life?...',
      source: { id: 'lrclib', name: 'LRCLIB' },
    })
    const useCase = makeUseCase(
      [makeProvider('lrcmux', plain).provider, makeProvider('lrclib', synced).provider],
      makeProvider('lyricsovh', null).provider,
    )

    const result = await useCase.execute(track)

    expect(result.source.id).toBe('lrclib')
  })

  it('em empate de qualidade, vence o primeiro da lista (lrcmux)', async () => {
    const useCase = makeUseCase(
      [
        makeProvider('lrcmux', makeLyrics({ source: { id: 'lrcmux', name: 'lrcmux' } })).provider,
        makeProvider('lrclib', makeLyrics({ source: { id: 'lrclib', name: 'LRCLIB' } })).provider,
      ],
      makeProvider('lyricsovh', null).provider,
    )

    const result = await useCase.execute(track)

    expect(result.source.id).toBe('lrcmux')
  })

  it('só chama o fallback quando TODOS os primários falham', async () => {
    const fallback = makeProvider(
      'lyricsovh',
      makeLyrics({ source: { id: 'lyricsovh', name: 'lyrics.ovh' } }),
    )

    const withPrimaryHit = makeUseCase(
      [
        makeProvider('lrcmux', null).provider,
        makeProvider('lrclib', makeLyrics({ source: { id: 'lrclib', name: 'LRCLIB' } })).provider,
      ],
      fallback.provider,
    )
    await withPrimaryHit.execute(track)
    expect(fallback.searchMock).not.toHaveBeenCalled()

    const allMiss = makeUseCase(
      [makeProvider('lrcmux', null).provider, makeProvider('lrclib', null).provider],
      fallback.provider,
    )
    const result = await allMiss.execute(track)
    expect(result.source.id).toBe('lyricsovh')
  })

  it('erro de provedor é tratado como miss (não derruba a busca)', async () => {
    const useCase = makeUseCase(
      [
        makeProvider('lrcmux', new Error('rede caiu')).provider,
        makeProvider('lrclib', makeLyrics({ source: { id: 'lrclib', name: 'LRCLIB' } })).provider,
      ],
      makeProvider('lyricsovh', null).provider,
    )

    const result = await useCase.execute(track)

    expect(result.source.id).toBe('lrclib')
  })

  it('lança LyricsNotFoundError quando nenhum provedor encontra', async () => {
    const useCase = makeUseCase(
      [makeProvider('lrcmux', null).provider, makeProvider('lrclib', new Error('5xx')).provider],
      makeProvider('lyricsovh', null).provider,
    )

    await expect(useCase.execute(track)).rejects.toBeInstanceOf(LyricsNotFoundError)
  })

  it('cacheia o resultado — segunda busca não chama provedores', async () => {
    const cache = new InMemoryCacheStore()
    const primary = makeProvider('lrcmux', makeLyrics())
    const useCase = makeUseCase([primary.provider], makeProvider('lyricsovh', null).provider, cache)

    await useCase.execute(track)
    await useCase.execute(track)

    expect(primary.searchMock).toHaveBeenCalledTimes(1)
  })
})

describe('pickBest', () => {
  it('retorna undefined para lista vazia', () => {
    expect(pickBest([])).toBeUndefined()
  })

  it('sincronizada vence texto puro', () => {
    const plain = makeLyrics()
    const synced = makeLyrics({ syncedLyrics: '[00:01.00] ...' })
    expect(pickBest([plain, synced])).toBe(synced)
  })
})
