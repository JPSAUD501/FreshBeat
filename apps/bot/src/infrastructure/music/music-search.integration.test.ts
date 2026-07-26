import { describe, expect, it } from 'vitest'
import { DeezerClient } from './deezer-client.js'
import { SpotifyClient } from './spotify-client.js'

/**
 * Testes de integração — APIs REAIS de busca musical.
 * Deezer é público (só precisa de rede); Spotify pula sem as credenciais.
 */
describe('DeezerClient (integração real)', () => {
  it('encontra Bohemian Rhapsody com metadados', async () => {
    const result = await new DeezerClient().searchTrack({
      track: 'Bohemian Rhapsody',
      artist: 'Queen',
    })
    expect(result).not.toBeNull()
    expect(result?.url).toContain('deezer.com')
    expect(result?.durationSeconds).toBeGreaterThan(300)
  })

  it('retorna null para faixa inexistente', async () => {
    const result = await new DeezerClient().searchTrack({
      track: 'musicaquenaoexiste12345',
      artist: 'artistaquenaoexiste67890',
    })
    expect(result).toBeNull()
  })
})

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const describeIfSpotify =
  clientId === undefined || clientSecret === undefined ? describe.skip : describe

describeIfSpotify('SpotifyClient (integração real)', () => {
  it('encontra Bohemian Rhapsody com popularidade', async () => {
    const client = new SpotifyClient(clientId!, clientSecret!)
    const result = await client.searchTrack({ track: 'Bohemian Rhapsody', artist: 'Queen' })
    expect(result).not.toBeNull()
    expect(result?.url).toContain('open.spotify.com')
    expect(result?.popularity).toBeGreaterThan(50)
    expect(result?.durationSeconds).toBeGreaterThan(300)
  })

  it('reusa o token entre chamadas (cache em memória)', async () => {
    const client = new SpotifyClient(clientId!, clientSecret!)
    await client.searchTrack({ track: 'Yellow', artist: 'Coldplay' })
    const second = await client.searchTrack({ track: 'Fix You', artist: 'Coldplay' })
    expect(second).not.toBeNull()
  })
})
