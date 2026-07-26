import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { LastFmRecentTrack } from '../../domain/ports/lastfm-api.js'
import { collapse, GetHistoryUseCase } from './get-history.js'

function track(
  name: string,
  options: { artist?: string; url?: string | null; nowPlaying?: boolean } = {},
): LastFmRecentTrack {
  return {
    name,
    artist: options.artist ?? 'Artist',
    url: options.url !== undefined ? options.url : `https://last.fm/${name}`,
    nowPlaying: options.nowPlaying ?? false,
  }
}

describe('collapse', () => {
  it('colapsa repetições consecutivas pela URL', () => {
    const result = collapse(
      [track('A'), track('A'), track('A'), track('B'), track('A')],
      'user',
      20,
    )

    expect(result.entries.map((entry) => [entry.name, entry.playCount])).toEqual([
      ['A', 3],
      ['B', 1],
      ['A', 1],
    ])
  })

  it('separa a faixa tocando agora da lista', () => {
    const result = collapse([track('Live', { nowPlaying: true }), track('A')], 'user', 20)

    expect(result.nowPlaying).toEqual({ name: 'Live', artist: 'Artist' })
    expect(result.entries.map((entry) => entry.name)).toEqual(['A'])
  })

  it('respeita o máximo de entradas (mas continua colapsando a última)', () => {
    const result = collapse([track('A'), track('B'), track('B'), track('B')], 'user', 2)

    expect(result.entries.map((entry) => [entry.name, entry.playCount])).toEqual([
      ['A', 1],
      ['B', 3],
    ])
  })

  it('sem URL, compara por nome+artista', () => {
    const result = collapse(
      [
        track('A', { url: null }),
        track('A', { url: null }),
        track('A', { artist: 'Outro', url: null }),
      ],
      'user',
      20,
    )

    expect(result.entries.map((entry) => [entry.name, entry.artist, entry.playCount])).toEqual([
      ['A', 'Artist', 2],
      ['A', 'Outro', 1],
    ])
  })

  it('lista vazia não quebra', () => {
    const result = collapse([], 'user', 20)
    expect(result.entries).toEqual([])
    expect(result.nowPlaying).toBeNull()
  })
})

describe('GetHistoryUseCase', () => {
  it('cacheia por usuário — segunda chamada não repete a API', async () => {
    const lastfm = {
      getTrackInfo: vi.fn(),
      getArtistInfo: vi.fn(),
      getAlbumInfo: vi.fn(),
      getTopTracksPage: vi.fn(),
      getRecentTracksPage: vi.fn().mockResolvedValue([track('A')]),
    }
    const useCase = new GetHistoryUseCase(lastfm, new InMemoryCacheStore())

    await useCase.execute({ username: 'user' })
    await useCase.execute({ username: 'user' })

    expect(lastfm.getRecentTracksPage).toHaveBeenCalledTimes(1)
  })
})
