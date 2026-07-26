import { InMemoryCacheStore } from '@freshbeat/cache'
import { describe, expect, it, vi } from 'vitest'
import { LastfmUserNotFoundError } from '../../domain/errors/app-error.js'
import type { LastFmTopTrack } from '../../domain/ports/lastfm-api.js'
import { GetBriefUseCase } from './get-brief.js'
import { GetUserTopTracksUseCase } from './get-user-top-tracks.js'

function topTrack(name: string, playcount: number, durationSeconds: number | null = 200) {
  return { name, artist: 'A', url: null, playcount, durationSeconds }
}

const allTopTracks: LastFmTopTrack[] = [topTrack('A', 10, 200), topTrack('B', 10, 200)]

function makeDeps(userInfo: object | null = {}) {
  const lastfm = {
    getTrackInfo: vi.fn(),
    getArtistInfo: vi.fn(),
    getAlbumInfo: vi.fn(),
    getTopTracksPage: vi.fn().mockResolvedValue({ tracks: [topTrack('Top1', 50)], total: 100 }),
    getRecentTracksPage: vi.fn(),
    getUserInfo: vi.fn().mockResolvedValue(
      userInfo === null
        ? null
        : {
            url: 'https://last.fm/user/u',
            imageUrl: 'https://last.fm/avatar.jpg',
            playcount: 1000,
            trackCount: 400,
            artistCount: 120,
            albumCount: 200,
          },
    ),
    getTopAlbums: vi
      .fn()
      .mockResolvedValue([{ name: 'Alb', artist: 'A', url: null, playcount: 30 }]),
    getTopArtists: vi.fn().mockResolvedValue([{ name: 'Art', url: null, playcount: 80 }]),
  }
  const getUserTopTracks = new GetUserTopTracksUseCase(lastfm, new InMemoryCacheStore())
  vi.spyOn(getUserTopTracks, 'execute').mockResolvedValue(allTopTracks)
  return { lastfm, getUserTopTracks }
}

describe('GetBriefUseCase', () => {
  it('monta métricas, rankings e tempo total', async () => {
    const deps = makeDeps()
    const useCase = new GetBriefUseCase(
      deps.lastfm,
      deps.getUserTopTracks,
      new InMemoryCacheStore(),
    )

    const brief = await useCase.execute({ username: 'user' })

    expect(brief.metrics).toEqual({
      playcount: 1000,
      trackCount: 400,
      artistCount: 120,
      albumCount: 200,
    })
    expect(brief.topTracks[0]?.name).toBe('Top1')
    expect(brief.topAlbums[0]?.name).toBe('Alb')
    expect(brief.topArtists[0]?.name).toBe('Art')
    // 2 faixas × 10 plays × 200s
    expect(brief.playtimeSeconds).toBe(2 * 10 * 200)
    expect(brief.playtimeApproximate).toBe(false)
    expect(brief.averageDurationSeconds).toBe(200)
  })

  it('lança LastfmUserNotFoundError quando o usuário não existe', async () => {
    const deps = makeDeps(null)
    const useCase = new GetBriefUseCase(
      deps.lastfm,
      deps.getUserTopTracks,
      new InMemoryCacheStore(),
    )

    await expect(useCase.execute({ username: 'ghost' })).rejects.toBeInstanceOf(
      LastfmUserNotFoundError,
    )
  })

  it('cacheia o resumo — segunda chamada não repete APIs', async () => {
    const deps = makeDeps()
    const useCase = new GetBriefUseCase(
      deps.lastfm,
      deps.getUserTopTracks,
      new InMemoryCacheStore(),
    )

    await useCase.execute({ username: 'user' })
    await useCase.execute({ username: 'user' })

    expect(deps.lastfm.getUserInfo).toHaveBeenCalledTimes(1)
  })
})
