import { InMemoryCacheStore } from '@freshbeat/cache'
import { createSilentLogger } from '@freshbeat/logging'
import { describe, expect, it, vi } from 'vitest'
import type { PlayingTrack } from '../../domain/entities/track.js'
import { NotListeningError } from '../../domain/errors/app-error.js'
import type { LastFmApi } from '../../domain/ports/lastfm-api.js'
import type { MusicSearchResult } from '../../domain/ports/music-search.js'
import { GetNowPlayingUseCase } from './get-now-playing.js'

const recentTrack: PlayingTrack = {
  name: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  nowPlaying: true,
}

const spotifyResult: MusicSearchResult = {
  url: 'https://open.spotify.com/track/123',
  explicit: false,
  popularity: 82,
  durationSeconds: 354,
}

const deezerResult: MusicSearchResult = {
  url: 'https://deezer.com/track/456',
  explicit: true,
  popularity: null,
  durationSeconds: 355,
}

function makeRecentTracks(track: PlayingTrack | null) {
  return { getMostRecentTrack: vi.fn().mockResolvedValue(track) }
}

function makeLastFm(overrides: Partial<LastFmApi> = {}) {
  return {
    getTrackInfo: vi.fn().mockResolvedValue({
      url: 'https://last.fm/track',
      durationSeconds: 354,
      userPlaycount: 42,
    }),
    getArtistInfo: vi.fn().mockResolvedValue({
      url: 'https://last.fm/artist',
      userPlaycount: 350,
      imageUrl: null,
    }),
    getAlbumInfo: vi.fn().mockResolvedValue({
      url: 'https://last.fm/album',
      userPlaycount: 120,
      imageUrl: 'https://last.fm/cover.jpg',
      trackNames: [],
    }),
    getTopTracksPage: vi.fn().mockResolvedValue(null),
    getRecentTracksPage: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

function makeSearch(id: string, result: MusicSearchResult | Error | null) {
  return {
    id,
    searchTrack: vi.fn().mockImplementation(() => {
      if (result instanceof Error) return Promise.reject(result)
      return Promise.resolve(result)
    }),
    searchAlbum: vi.fn().mockResolvedValue(null),
    searchArtist: vi.fn().mockResolvedValue(null),
  }
}

function makeUseCase(
  overrides: {
    recentTracks?: ReturnType<typeof makeRecentTracks>
    lastfm?: ReturnType<typeof makeLastFm>
    musicSearch?: ReturnType<typeof makeSearch>[]
    cache?: InMemoryCacheStore
  } = {},
) {
  return new GetNowPlayingUseCase({
    recentTracks: overrides.recentTracks ?? makeRecentTracks(recentTrack),
    lastfm: overrides.lastfm ?? makeLastFm(),
    musicSearch: overrides.musicSearch ?? [
      makeSearch('spotify', spotifyResult),
      makeSearch('deezer', deezerResult),
    ],
    cache: overrides.cache ?? new InMemoryCacheStore(),
    logger: createSilentLogger(),
  })
}

describe('GetNowPlayingUseCase', () => {
  it('lança NotListeningError quando não há nada tocando', async () => {
    const useCase = makeUseCase({ recentTracks: makeRecentTracks(null) })
    await expect(useCase.execute({ lastfmUsername: 'user' })).rejects.toBeInstanceOf(
      NotListeningError,
    )
  })

  it('monta a visão completa: scrobbles, links, imagem, popularidade', async () => {
    const useCase = makeUseCase()

    const info = await useCase.execute({ lastfmUsername: 'user' })

    expect(info.nowPlaying).toBe(true)
    expect(info.trackName).toBe('Bohemian Rhapsody')
    expect(info.albumName).toBe('A Night at the Opera')
    expect(info.imageUrl).toBe('https://last.fm/cover.jpg')
    expect(info.scrobbles).toEqual({ track: 42, album: 120, artist: 350 })
    expect(info.links.spotify).toBe('https://open.spotify.com/track/123')
    expect(info.links.deezer).toBe('https://deezer.com/track/456')
    expect(info.popularity).toBe(82)
    // explícita no Deezer → badge mesmo com Spotify false
    expect(info.explicit).toBe(true)
    // 42 plays × 354s
    expect(info.listeningSeconds).toBe(42 * 354)
  })

  it('falha de busca externa degrada para null sem derrubar', async () => {
    const useCase = makeUseCase({
      musicSearch: [makeSearch('spotify', new Error('quota')), makeSearch('deezer', null)],
    })

    const info = await useCase.execute({ lastfmUsername: 'user' })

    expect(info.links.spotify).toBeNull()
    expect(info.links.deezer).toBeNull()
    expect(info.popularity).toBeNull()
    expect(info.explicit).toBe(false)
    // dados do Last.fm continuam presentes
    expect(info.scrobbles.track).toBe(42)
  })

  it('cai na duração do Spotify quando o Last.fm não tem', async () => {
    const useCase = makeUseCase({
      lastfm: makeLastFm({
        getTrackInfo: vi
          .fn()
          .mockResolvedValue({ url: null, durationSeconds: null, userPlaycount: 42 }),
      }),
    })

    const info = await useCase.execute({ lastfmUsername: 'user' })

    expect(info.durationSeconds).toBe(354)
    expect(info.listeningSeconds).toBe(42 * 354)
  })

  it('sem playcount ou duração, não inventa tempo de audição', async () => {
    const useCase = makeUseCase({
      lastfm: makeLastFm({
        getTrackInfo: vi
          .fn()
          .mockResolvedValue({ url: null, durationSeconds: null, userPlaycount: 0 }),
      }),
      musicSearch: [],
    })

    const info = await useCase.execute({ lastfmUsername: 'user' })

    expect(info.listeningSeconds).toBeNull()
  })

  it('cacheia o enriquecimento — segunda chamada não repete APIs', async () => {
    const lastfm = makeLastFm()
    const spotify = makeSearch('spotify', spotifyResult)
    const useCase = makeUseCase({ lastfm, musicSearch: [spotify] })

    await useCase.execute({ lastfmUsername: 'user' })
    await useCase.execute({ lastfmUsername: 'user' })

    expect(lastfm.getTrackInfo).toHaveBeenCalledTimes(1)
    expect(spotify.searchTrack).toHaveBeenCalledTimes(1)
  })

  it('não chama album.getInfo quando a faixa não tem álbum', async () => {
    const lastfm = makeLastFm()
    const useCase = makeUseCase({
      recentTracks: makeRecentTracks({ name: 'Loose', artist: 'Indie', nowPlaying: false }),
      lastfm,
    })

    const info = await useCase.execute({ lastfmUsername: 'user' })

    expect(lastfm.getAlbumInfo).not.toHaveBeenCalled()
    expect(info.albumName).toBeNull()
    expect(info.nowPlaying).toBe(false)
  })
})
