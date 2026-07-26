import { afterEach, describe, expect, it, vi } from 'vitest'
import { LrcmuxProvider } from './lrcmux.provider.js'
import { LrclibProvider } from './lrclib.provider.js'
import { LyricsOvhProvider } from './lyrics-ovh.provider.js'
import { toLyrics, type LrclibGetResponse } from './lrclib-api.js'

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const lrclibPayload: LrclibGetResponse = {
  id: 1,
  trackName: 'Bohemian Rhapsody',
  artistName: 'Queen',
  albumName: 'A Night at the Opera',
  duration: 354,
  instrumental: false,
  plainLyrics: 'Is this the real life?\nIs this just fantasy?',
  syncedLyrics: '[00:01.00] Is this the real life?',
}

describe('LrclibProvider', () => {
  it('mapeia resposta LRCLIB para Lyrics', async () => {
    mockFetchOnce(200, lrclibPayload)
    const provider = new LrclibProvider()

    const lyrics = await provider.search({ name: 'Bohemian Rhapsody', artist: 'Queen' })

    expect(lyrics?.source.id).toBe('lrclib')
    expect(lyrics?.plainLyrics).toContain('real life')
    expect(lyrics?.syncedLyrics).toContain('[00:01.00]')
    const url = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(url).toContain('https://lrclib.net/api/get?')
    expect(url).toContain('track_name=Bohemian+Rhapsody')
    expect(url).toContain('artist_name=Queen')
  })

  it('retorna null em 404', async () => {
    mockFetchOnce(404, { code: 404, name: 'TrackNotFound', message: 'not found' })
    const provider = new LrclibProvider()
    expect(await provider.search({ name: 'x', artist: 'y' })).toBeNull()
  })
})

describe('LrcmuxProvider', () => {
  it('usa o endpoint de compatibilidade LRCLIB do lrcmux', async () => {
    mockFetchOnce(200, lrclibPayload)
    const provider = new LrcmuxProvider()

    const lyrics = await provider.search({ name: 'Bohemian Rhapsody', artist: 'Queen' })

    expect(lyrics?.source.id).toBe('lrcmux')
    const url = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(url).toContain('https://api.lrcmux.dev/compat/lrclib/api/get?')
  })
})

describe('LyricsOvhProvider', () => {
  it('mapeia resposta e faz URL encoding de artista/título', async () => {
    mockFetchOnce(200, { lyrics: 'Look at the stars' })
    const provider = new LyricsOvhProvider()

    const lyrics = await provider.search({ name: 'Back in Black', artist: 'AC/DC' })

    expect(lyrics?.plainLyrics).toBe('Look at the stars')
    expect(lyrics?.syncedLyrics).toBeNull()
    const url = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(url).toBe('https://api.lyrics.ovh/v1/AC%2FDC/Back%20in%20Black')
  })

  it('retorna null quando a letra vem vazia', async () => {
    mockFetchOnce(200, { lyrics: '   ' })
    const provider = new LyricsOvhProvider()
    expect(await provider.search({ name: 'x', artist: 'y' })).toBeNull()
  })
})

describe('toLyrics', () => {
  it('marca faixa instrumental', () => {
    const lyrics = toLyrics(
      { ...lrclibPayload, instrumental: true, plainLyrics: null, syncedLyrics: null },
      { id: 'lrclib', name: 'LRCLIB' },
    )
    expect(lyrics?.instrumental).toBe(true)
  })

  it('retorna null quando não há letra nenhuma e não é instrumental', () => {
    const lyrics = toLyrics(
      { ...lrclibPayload, plainLyrics: null, syncedLyrics: null },
      { id: 'lrclib', name: 'LRCLIB' },
    )
    expect(lyrics).toBeNull()
  })
})
