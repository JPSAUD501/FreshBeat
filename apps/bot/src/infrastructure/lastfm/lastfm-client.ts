import { z } from 'zod'
import type { PlayingTrack } from '../../domain/entities/track.js'
import type {
  LastFmAlbumInfo,
  LastFmApi,
  LastFmArtistInfo,
  LastFmTrackInfo,
} from '../../domain/ports/lastfm-api.js'
import type { RecentTracksProvider } from '../../domain/ports/recent-tracks.js'
import { fetchJson } from '../http/fetch-json.js'

const recentTracksResponseSchema = z.object({
  recenttracks: z.object({
    track: z.array(
      z.object({
        name: z.string(),
        artist: z.object({ '#text': z.string() }),
        album: z.object({ '#text': z.string() }).optional(),
        duration: z.string().optional(),
        '@attr': z.object({ nowplaying: z.string().optional() }).optional(),
      }),
    ),
  }),
})

const numericString = z
  .string()
  .optional()
  .transform((value) => {
    const parsed = Number(value ?? '')
    return Number.isFinite(parsed) ? parsed : null
  })

const lastfmImages = z
  .array(z.object({ '#text': z.string(), size: z.string() }))
  .optional()
  .transform((images) => {
    // A última imagem não-vazia é a de maior resolução
    const urls = (images ?? []).map((image) => image['#text']).filter((url) => url !== '')
    return urls.at(-1) ?? null
  })

// O Last.fm pode responder 200 com corpo de erro ({"error":6,...}) —
// a chave raiz é opcional e tratamos ausência como "não encontrado".
const trackInfoResponseSchema = z.object({
  track: z
    .object({
      url: z.string().optional(),
      duration: numericString,
      userplaycount: numericString,
    })
    .optional(),
})

const artistInfoResponseSchema = z.object({
  artist: z
    .object({
      url: z.string().optional(),
      stats: z.object({ userplaycount: numericString }).optional(),
      image: lastfmImages,
    })
    .optional(),
})

const albumInfoResponseSchema = z.object({
  album: z
    .object({
      url: z.string().optional(),
      userplaycount: numericString,
      image: lastfmImages,
    })
    .optional(),
})

/** Last.fm API (https://www.last.fm/api). */
export class LastFmClient implements RecentTracksProvider, LastFmApi {
  private readonly baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  constructor(private readonly apiKey: string) {}

  async getMostRecentTrack(lastfmUsername: string): Promise<PlayingTrack | null> {
    const response = await this.call('user.getRecentTracks', recentTracksResponseSchema, {
      user: lastfmUsername,
      limit: '1',
      extended: '1',
    })
    const track = response?.recenttracks.track[0]
    if (track === undefined) return null

    const durationSeconds = Number(track.duration ?? '')
    const album = track.album?.['#text']
    return {
      name: track.name,
      artist: track.artist['#text'],
      ...(album !== undefined && album !== '' ? { album } : {}),
      ...(Number.isFinite(durationSeconds) && durationSeconds > 0 ? { durationSeconds } : {}),
      nowPlaying: track['@attr']?.nowplaying === 'true',
    }
  }

  async getTrackInfo(input: {
    track: string
    artist: string
    username: string
  }): Promise<LastFmTrackInfo | null> {
    const response = await this.call('track.getInfo', trackInfoResponseSchema, {
      track: input.track,
      artist: input.artist,
      username: input.username,
    })
    if (response?.track === undefined) return null

    const durationMs = response.track.duration
    return {
      url: response.track.url ?? null,
      // track.getInfo retorna duração em MILISSEGUNDOS
      durationSeconds: durationMs !== null && durationMs > 0 ? Math.round(durationMs / 1000) : null,
      userPlaycount: response.track.userplaycount,
    }
  }

  async getArtistInfo(input: {
    artist: string
    username: string
  }): Promise<LastFmArtistInfo | null> {
    const response = await this.call('artist.getInfo', artistInfoResponseSchema, {
      artist: input.artist,
      username: input.username,
    })
    if (response?.artist === undefined) return null

    return {
      url: response.artist.url ?? null,
      userPlaycount: response.artist.stats?.userplaycount ?? null,
      imageUrl: response.artist.image,
    }
  }

  async getAlbumInfo(input: {
    album: string
    artist: string
    username: string
  }): Promise<LastFmAlbumInfo | null> {
    const response = await this.call('album.getInfo', albumInfoResponseSchema, {
      album: input.album,
      artist: input.artist,
      username: input.username,
    })
    if (response?.album === undefined) return null

    return {
      url: response.album.url ?? null,
      userPlaycount: response.album.userplaycount,
      imageUrl: response.album.image,
    }
  }

  private async call<T>(
    method: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    params: Record<string, string>,
  ): Promise<T | null> {
    const search = new URLSearchParams({
      method,
      api_key: this.apiKey,
      format: 'json',
      ...params,
    })
    return fetchJson(`${this.baseUrl}?${search.toString()}`, schema)
  }
}
