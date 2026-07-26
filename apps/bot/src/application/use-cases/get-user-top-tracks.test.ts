import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import type { LastFmTopTrack, LastFmTopTracksPage } from '../../domain/ports/lastfm-api.js'
import { GetUserTopTracksUseCase } from './get-user-top-tracks.js'

function topTrack(name: string): LastFmTopTrack {
  return { name, artist: 'A', url: null, playcount: 1, durationSeconds: 100 }
}

function page(names: string[], total: number): LastFmTopTracksPage {
  return { tracks: names.map(topTrack), total }
}

function makeLastFm(pages: Map<number, LastFmTopTracksPage>) {
  return {
    getTrackInfo: vi.fn(),
    getArtistInfo: vi.fn(),
    getAlbumInfo: vi.fn(),
    getTopTracksPage: vi
      .fn()
      .mockImplementation(({ page: p }: { page: number }) => Promise.resolve(pages.get(p) ?? null)),
    getRecentTracksPage: vi.fn(),
    getUserInfo: vi.fn(),
    getTopAlbums: vi.fn(),
    getTopArtists: vi.fn(),
  }
}

describe('GetUserTopTracksUseCase', () => {
  it('busca página única quando cabe tudo nela', async () => {
    const lastfm = makeLastFm(new Map([[1, page(['a', 'b'], 2)]]))
    const useCase = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())

    const tracks = await useCase.execute({ username: 'user' })

    expect(tracks.map((track) => track.name)).toEqual(['a', 'b'])
    expect(lastfm.getTopTracksPage).toHaveBeenCalledTimes(1)
  })

  it('pagina até o total (limit=1000) e concatena em ordem', async () => {
    // total 2500 com limit 1000 → 3 páginas
    const lastfm = makeLastFm(
      new Map([
        [1, page(['a'], 2500)],
        [2, page(['b'], 2500)],
        [3, page(['c'], 2500)],
      ]),
    )
    const useCase = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())

    const tracks = await useCase.execute({ username: 'user' })

    expect(tracks.map((track) => track.name)).toEqual(['a', 'b', 'c'])
    expect(lastfm.getTopTracksPage).toHaveBeenCalledTimes(3)
  })

  it('cacheia — segunda chamada não repete requests', async () => {
    const lastfm = makeLastFm(new Map([[1, page(['a'], 1)]]))
    const useCase = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())

    await useCase.execute({ username: 'user' })
    await useCase.execute({ username: 'user' })

    expect(lastfm.getTopTracksPage).toHaveBeenCalledTimes(1)
  })

  it('retorna vazio quando a API falha', async () => {
    const lastfm = makeLastFm(new Map())
    const useCase = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())

    expect(await useCase.execute({ username: 'user' })).toEqual([])
  })
})
