import { afterEach, describe, expect, it, vi } from 'vitest'
import { LastFmClient } from './lastfm-client.js'

function mockFetchOnce(payload: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
  )
}

/** A API do Last.fm às vezes manda contadores como número cru em vez de string. */
describe('LastFmClient — tolerância a números crus da API', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('album.getInfo aceita userplaycount como número', async () => {
    mockFetchOnce({
      album: { name: 'Hurry Up', artist: 'M83', userplaycount: 42, tracks: { track: [] } },
    })
    const client = new LastFmClient('key')
    const info = await client.getAlbumInfo({ album: 'Hurry Up', artist: 'M83', username: 'u' })
    expect(info?.userPlaycount).toBe(42)
  })

  it('album.getInfo aceita userplaycount como string', async () => {
    mockFetchOnce({
      album: { name: 'Hurry Up', artist: 'M83', userplaycount: '42', tracks: { track: [] } },
    })
    const client = new LastFmClient('key')
    const info = await client.getAlbumInfo({ album: 'Hurry Up', artist: 'M83', username: 'u' })
    expect(info?.userPlaycount).toBe(42)
  })

  it('track.getInfo aceita duration e userplaycount como número', async () => {
    mockFetchOnce({
      track: {
        name: 'Midnight City',
        artist: { name: 'M83' },
        duration: 243000,
        userplaycount: 128,
      },
    })
    const client = new LastFmClient('key')
    const info = await client.getTrackInfo({
      track: 'Midnight City',
      artist: 'M83',
      username: 'u',
    })
    expect(info?.durationSeconds).toBe(243)
    expect(info?.userPlaycount).toBe(128)
  })

  it('user.getRecentTracks aceita duration como número', async () => {
    mockFetchOnce({
      recenttracks: {
        track: [
          {
            name: 'Angel',
            artist: { '#text': 'Shaggy' },
            album: { '#text': 'Hot Shot' },
            duration: 233,
          },
        ],
      },
    })
    const client = new LastFmClient('key')
    const tracks = await client.getRecentTracksPage({ username: 'u', limit: 1, page: 1 })
    expect(tracks).toHaveLength(1)
    expect(tracks[0]?.name).toBe('Angel')
  })
})
