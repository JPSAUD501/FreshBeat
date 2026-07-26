import { describe, expect, it } from 'vitest'
import { LastFmClient } from './lastfm-client.js'

/**
 * Testes de integração — API REAL do Last.fm.
 * Opt-in: pulam sem LASTFM_API_KEY (rodam agendados no CI com segredos).
 */
const apiKey = process.env.LASTFM_API_KEY
const describeIfKey = apiKey === undefined ? describe.skip : describe

describeIfKey('LastFmClient (integração real)', () => {
  const client = new LastFmClient(apiKey!)

  it('track.getInfo retorna duração em segundos e URL', async () => {
    const info = await client.getTrackInfo({
      track: 'Bohemian Rhapsody',
      artist: 'Queen',
      username: 'rj',
    })
    expect(info).not.toBeNull()
    expect(info?.durationSeconds).toBeGreaterThan(300)
    expect(info?.url).toContain('last.fm')
  })

  it('track.getInfo retorna null para faixa inexistente', async () => {
    const info = await client.getTrackInfo({
      track: 'musicaquenaoexiste12345',
      artist: 'artistaquenaoexiste67890',
      username: 'rj',
    })
    expect(info).toBeNull()
  })

  it('user.getInfo retorna métricas de um usuário público', async () => {
    const info = await client.getUserInfo({ username: 'rj' })
    expect(info).not.toBeNull()
    expect(info?.playcount).toBeGreaterThan(0)
  })

  it('user.getRecentTracks marca o @attr agora tocando (extended=1)', async () => {
    const page = await client.getRecentTracksPage({ username: 'rj', page: 1, limit: 5 })
    expect(Array.isArray(page)).toBe(true)
    expect(page.length).toBeGreaterThan(0)
    // artista vem de artist.name com extended=1 — regressão do bug latente
    expect(page[0]?.artist).toBeTruthy()
  })

  it('artist.getInfo e album.getInfo retornam dados básicos', async () => {
    const artist = await client.getArtistInfo({ artist: 'Queen', username: 'rj' })
    expect(artist).not.toBeNull()
    const album = await client.getAlbumInfo({
      album: 'A Night at the Opera',
      artist: 'Queen',
      username: 'rj',
    })
    expect(album).not.toBeNull()
    expect(album?.trackNames.length).toBeGreaterThan(5)
  })
})
