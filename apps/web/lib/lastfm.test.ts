import type { CacheStore } from '@freshbeat/cache'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRecentTracks, getTopArtists, getTopTracks, getUserStats } from './lastfm'

const OPTIONS = { apiKey: 'test-key' }

function mockFetchJson(body: unknown, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      json: async () => body,
    })),
  )
}

function lastFetchUrl(): string {
  const mock = vi.mocked(fetch)
  const call = mock.mock.calls[0]
  if (call === undefined) throw new Error('fetch não foi chamado')
  return String(call[0])
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getUserStats', () => {
  it('mapeia os contadores do user.getInfo', async () => {
    mockFetchJson({
      user: {
        playcount: '151481',
        artist_count: '12763',
        album_count: '26742',
        track_count: '57239',
      },
    })
    const stats = await getUserStats(OPTIONS, 'rj')
    expect(stats).toEqual({ scrobbles: 151481, artists: 12763, albums: 26742, tracks: 57239 })
    expect(lastFetchUrl()).toContain('method=user.getInfo')
    expect(lastFetchUrl()).toContain('user=rj')
  })

  it('degrada para null quando a API falha', async () => {
    mockFetchJson({}, false)
    expect(await getUserStats(OPTIONS, 'rj')).toBeNull()
  })

  it('degrada para null em erro de rede', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNRESET')
      }),
    )
    expect(await getUserStats(OPTIONS, 'rj')).toBeNull()
  })

  it('degrada para null quando o payload não bate com o schema', async () => {
    mockFetchJson({ error: 6, message: 'User not found' })
    expect(await getUserStats(OPTIONS, 'rj')).toBeNull()
  })
})

describe('getRecentTracks', () => {
  it('marca faixa tocando agora e converte uts para Date', async () => {
    mockFetchJson({
      recenttracks: {
        track: [
          {
            name: 'Tocando',
            artist: { '#text': 'Artista' },
            album: { '#text': 'Álbum' },
            image: [{ '#text': 'https://img/xl.png', size: 'extralarge' }],
            url: 'https://last.fm/track',
            '@attr': { nowplaying: 'true' },
          },
          {
            name: 'Antiga',
            artist: { '#text': 'Artista' },
            album: { '#text': '' },
            date: { uts: '1700000000' },
          },
        ],
      },
    })
    const tracks = await getRecentTracks(OPTIONS, 'rj', 5)
    expect(tracks).toHaveLength(2)
    const [current, older] = tracks ?? []
    expect(current?.nowPlaying).toBe(true)
    expect(current?.playedAt).toBeNull()
    expect(current?.image).toBe('https://img/xl.png')
    expect(older?.nowPlaying).toBe(false)
    expect(older?.playedAt).toEqual(new Date(1_700_000_000_000))
    expect(older?.album).toBeNull()
    expect(older?.image).toBeNull()
  })
})

describe('getTopTracks', () => {
  it('passa o período para a API e converte playcount/duração', async () => {
    mockFetchJson({
      toptracks: {
        track: [
          {
            name: 'Sultans of Swing',
            artist: { name: 'Dire Straits' },
            playcount: '106',
            duration: '346',
            url: 'https://last.fm/track',
          },
          { name: 'Sem duração', artist: { name: 'X' }, playcount: '3', duration: '0' },
        ],
      },
    })
    const tracks = await getTopTracks(OPTIONS, 'rj', 'overall', 50)
    expect(lastFetchUrl()).toContain('period=overall')
    expect(lastFetchUrl()).toContain('limit=50')
    expect(tracks?.[0]).toMatchObject({ playcount: 106, durationSeconds: 346 })
    expect(tracks?.[1]?.durationSeconds).toBeNull()
  })
})

describe('getTopArtists', () => {
  it('mapeia playcount e ignora imagem vazia', async () => {
    mockFetchJson({
      topartists: {
        artist: [
          {
            name: 'Green Day',
            playcount: '9',
            image: [{ '#text': '', size: 'extralarge' }],
          },
        ],
      },
    })
    const artists = await getTopArtists(OPTIONS, 'rj', '1month')
    expect(lastFetchUrl()).toContain('period=1month')
    expect(artists?.[0]).toMatchObject({ name: 'Green Day', playcount: 9, image: null })
  })
})

describe('cache', () => {
  function makeCache(): CacheStore & { stored: Map<string, unknown> } {
    const stored = new Map<string, unknown>()
    return {
      stored,
      get: async <T>(key: string) => stored.get(key) as T | undefined,
      set: async <T>(key: string, value: T) => {
        stored.set(key, value)
      },
      delete: async (key: string) => {
        stored.delete(key)
      },
      consume: async <T>(key: string) => {
        const value = stored.get(key) as T | undefined
        stored.delete(key)
        return value
      },
    }
  }

  it('segunda chamada com cache não bate na API de novo', async () => {
    mockFetchJson({
      user: { playcount: '10', artist_count: '1', album_count: '1', track_count: '1' },
    })
    const cache = makeCache()
    const first = await getUserStats({ ...OPTIONS, cache }, 'rj')
    const second = await getUserStats({ ...OPTIONS, cache }, 'rj')
    expect(first).toEqual(second)
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
  })

  it('sem cache toda chamada bate na API', async () => {
    mockFetchJson({
      user: { playcount: '10', artist_count: '1', album_count: '1', track_count: '1' },
    })
    await getUserStats(OPTIONS, 'rj')
    await getUserStats(OPTIONS, 'rj')
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2)
  })
})
