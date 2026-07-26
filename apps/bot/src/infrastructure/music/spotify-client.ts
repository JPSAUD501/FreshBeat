import { z } from 'zod'
import type { MusicSearchProvider, MusicSearchResult } from '../../domain/ports/music-search.js'
import { fetchJson } from '../http/fetch-json.js'

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
})

const searchResponseSchema = z.object({
  tracks: z.object({
    items: z.array(
      z.object({
        external_urls: z.object({ spotify: z.string() }),
        explicit: z.boolean(),
        popularity: z.number(),
        duration_ms: z.number(),
      }),
    ),
  }),
})

/** Margem para renovar o token antes de expirar. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000

/**
 * Spotify Web API (client credentials — só busca pública).
 * O token é cacheado em memória até perto da expiração.
 */
export class SpotifyClient implements MusicSearchProvider {
  readonly id = 'spotify'
  private token: { value: string; expiresAt: number } | null = null

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async searchTrack(input: { track: string; artist: string }): Promise<MusicSearchResult | null> {
    const accessToken = await this.getAccessToken()
    const query = new URLSearchParams({
      q: `${input.track} ${input.artist}`,
      type: 'track',
      limit: '1',
    })
    const response = await fetchJson(
      `https://api.spotify.com/v1/search?${query.toString()}`,
      searchResponseSchema,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    const item = response?.tracks.items[0]
    if (item === undefined) return null

    return {
      url: item.external_urls.spotify,
      explicit: item.explicit,
      popularity: item.popularity,
      durationSeconds: Math.round(item.duration_ms / 1000),
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.token !== null && Date.now() < this.token.expiresAt) {
      return this.token.value
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      throw new Error(`Spotify auth respondeu HTTP ${response.status}`)
    }

    const body = tokenResponseSchema.parse(await response.json())
    this.token = {
      value: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
    }
    return body.access_token
  }
}
