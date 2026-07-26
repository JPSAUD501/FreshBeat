import { InMemoryCacheStore } from '@freshbeat/cache'
import { createSilentLogger } from '@freshbeat/logging'
import { describe, expect, it, vi } from 'vitest'
import type { PlayingTrack } from '../../domain/entities/track.js'
import { AlbumNotIdentifiedError, NotListeningError } from '../../domain/errors/app-error.js'
import type { LastFmTopTrack } from '../../domain/ports/lastfm-api.js'
import { GetAlbumOverviewUseCase, GetArtistOverviewUseCase } from './get-overview.js'
import { GetUserTopTracksUseCase } from './get-user-top-tracks.js'

const recentTrack: PlayingTrack = {
  name: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  nowPlaying: true,
}

function topTrack(
  name: string,
  artist: string,
  playcount: number,
  durationSeconds: number | null = 200,
): LastFmTopTrack {
  return { name, artist, url: null, playcount, durationSeconds }
}

const userTopTracks = [
  topTrack('Bohemian Rhapsody', 'Queen', 42),
  topTrack('Love of My Life', 'Queen', 30, null),
  topTrack('Other Song', 'Someone Else', 99),
]

function makeDeps(
  overrides: {
    recent?: PlayingTrack | null
    albumTrackNames?: string[]
    cache?: InMemoryCacheStore
  } = {},
) {
  const recentTracks = {
    getMostRecentTrack: vi
      .fn()
      .mockResolvedValue(overrides.recent !== undefined ? overrides.recent : recentTrack),
  }
  const lastfm = {
    getTrackInfo: vi.fn(),
    getArtistInfo: vi.fn().mockResolvedValue({
      url: 'https://last.fm/artist',
      userPlaycount: 350,
      imageUrl: 'https://last.fm/artist.jpg',
    }),
    getAlbumInfo: vi.fn().mockResolvedValue({
      url: 'https://last.fm/album',
      userPlaycount: 120,
      imageUrl: 'https://last.fm/cover.jpg',
      trackNames: overrides.albumTrackNames ?? ['Bohemian Rhapsody', 'Love of My Life'],
    }),
    getTopTracksPage: vi.fn(),
    getRecentTracksPage: vi.fn(),
  }
  const musicSearch = [
    {
      id: 'spotify',
      searchTrack: vi.fn(),
      searchAlbum: vi.fn().mockResolvedValue('https://spotify/album'),
      searchArtist: vi.fn().mockResolvedValue('https://spotify/artist'),
    },
  ]
  const cache = overrides.cache ?? new InMemoryCacheStore()
  const getUserTopTracks = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())
  // SemLastFm real: injetamos a lista direto sobrescrevendo o execute
  vi.spyOn(getUserTopTracks, 'execute').mockResolvedValue(userTopTracks)

  return {
    recentTracks,
    lastfm,
    musicSearch,
    getUserTopTracks,
    cache,
    logger: createSilentLogger(),
  }
}

describe('GetAlbumOverviewUseCase', () => {
  it('filtra as top tracks do usuário pela tracklist do álbum', async () => {
    const deps = makeDeps()
    const useCase = new GetAlbumOverviewUseCase(deps)

    const overview = await useCase.execute({ username: 'user' })

    expect(overview.name).toBe('A Night at the Opera')
    expect(overview.artistName).toBe('Queen')
    expect(overview.imageUrl).toBe('https://last.fm/cover.jpg')
    expect(overview.scrobbles).toBe(120)
    expect(overview.spotifyUrl).toBe('https://spotify/album')
    expect(overview.topTracks.map((track) => track.name)).toEqual([
      'Bohemian Rhapsody',
      'Love of My Life',
    ])
    // playtime: 42×200 + 30×(média 200) — estimado
    expect(overview.playtimeSeconds).toBe(42 * 200 + 30 * 200)
    expect(overview.playtimeApproximate).toBe(true)
  })

  it('lança AlbumNotIdentifiedError quando a faixa não tem álbum', async () => {
    const deps = makeDeps({ recent: { name: 'Loose', artist: 'Indie', nowPlaying: true } })
    const useCase = new GetAlbumOverviewUseCase(deps)

    await expect(useCase.execute({ username: 'user' })).rejects.toBeInstanceOf(
      AlbumNotIdentifiedError,
    )
  })

  it('lança NotListeningError sem nada tocando', async () => {
    const deps = makeDeps({ recent: null })
    const useCase = new GetAlbumOverviewUseCase(deps)

    await expect(useCase.execute({ username: 'user' })).rejects.toBeInstanceOf(NotListeningError)
  })
})

describe('GetArtistOverviewUseCase', () => {
  it('filtra as top tracks do usuário pelo artista', async () => {
    const deps = makeDeps()
    const useCase = new GetArtistOverviewUseCase(deps)

    const overview = await useCase.execute({ username: 'user' })

    expect(overview.name).toBe('Queen')
    expect(overview.scrobbles).toBe(350)
    expect(overview.spotifyUrl).toBe('https://spotify/artist')
    expect(overview.topTracks.map((track) => track.name)).toEqual([
      'Bohemian Rhapsody',
      'Love of My Life',
    ])
  })

  it('ordena por playcount decrescente', async () => {
    const deps = makeDeps()
    vi.spyOn(deps.getUserTopTracks, 'execute').mockResolvedValue([
      topTrack('Love of My Life', 'Queen', 30),
      topTrack('Bohemian Rhapsody', 'Queen', 42),
    ])
    const useCase = new GetArtistOverviewUseCase(deps)

    const overview = await useCase.execute({ username: 'user' })

    expect(overview.topTracks[0]?.name).toBe('Bohemian Rhapsody')
  })
})
