import { z } from 'zod'
import type { PlayingTrack } from '../../domain/entities/track.js'
import type {
  LastFmAlbumInfo,
  LastFmApi,
  LastFmArtistInfo,
  LastFmRecentTrack,
  LastFmTopAlbum,
  LastFmTopArtist,
  LastFmTopTracksPage,
  LastFmTrackInfo,
  LastFmUserInfo,
} from '../../domain/ports/lastfm-api.js'
import type { RecentTracksProvider } from '../../domain/ports/recent-tracks.js'
import { fetchJson } from '../http/fetch-json.js'

// Com extended=1 o artista vem como {name, mbid, url}; sem, como {'#text'}.
// Aceitamos os dois formatos.
const recentTrackArtist = z
  .object({ name: z.string().optional(), '#text': z.string().optional() })
  .transform((artist) => artist.name ?? artist['#text'] ?? '')

const recentTrackSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  artist: recentTrackArtist,
  album: z.object({ '#text': z.string() }).optional(),
  duration: z.string().optional(),
  '@attr': z.object({ nowplaying: z.string().optional() }).optional(),
})

const recentTracksResponseSchema = z.object({
  recenttracks: z.object({
    track: z.array(recentTrackSchema),
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
      // Álbum de faixa única pode vir como objeto, não array
      tracks: z
        .object({
          track: z.union([z.array(z.object({ name: z.string() })), z.object({ name: z.string() })]),
        })
        .optional(),
    })
    .optional(),
})

const topTracksResponseSchema = z.object({
  toptracks: z
    .object({
      track: z.array(
        z.object({
          name: z.string(),
          url: z.string().optional(),
          playcount: numericString,
          duration: numericString,
          artist: z.object({ name: z.string() }),
        }),
      ),
      '@attr': z.object({ total: numericString }),
    })
    .optional(),
})

const userInfoResponseSchema = z.object({
  user: z
    .object({
      url: z.string().optional(),
      playcount: numericString,
      track_count: numericString,
      artist_count: numericString,
      album_count: numericString,
      image: lastfmImages,
    })
    .optional(),
})

const topAlbumsResponseSchema = z.object({
  topalbums: z
    .object({
      album: z.array(
        z.object({
          name: z.string(),
          url: z.string().optional(),
          playcount: numericString,
          artist: z.object({ name: z.string() }),
        }),
      ),
    })
    .optional(),
})

const topArtistsResponseSchema = z.object({
  topartists: z
    .object({
      artist: z.array(
        z.object({
          name: z.string(),
          url: z.string().optional(),
          playcount: numericString,
        }),
      ),
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
      artist: track.artist,
      ...(album !== undefined && album !== '' ? { album } : {}),
      ...(Number.isFinite(durationSeconds) && durationSeconds > 0 ? { durationSeconds } : {}),
      nowPlaying: track['@attr']?.nowplaying === 'true',
    }
  }

  async getRecentTracksPage(input: {
    username: string
    limit: number
    page: number
  }): Promise<LastFmRecentTrack[]> {
    const response = await this.call('user.getRecentTracks', recentTracksResponseSchema, {
      user: input.username,
      limit: String(input.limit),
      page: String(input.page),
      extended: '1',
    })

    return (response?.recenttracks.track ?? []).map((track) => ({
      name: track.name,
      artist: track.artist,
      url: track.url ?? null,
      nowPlaying: track['@attr']?.nowplaying === 'true',
    }))
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

    const tracklist = response.album.tracks?.track
    const trackNames = Array.isArray(tracklist)
      ? tracklist.map((track) => track.name)
      : tracklist !== undefined
        ? [tracklist.name]
        : []

    return {
      url: response.album.url ?? null,
      userPlaycount: response.album.userplaycount,
      imageUrl: response.album.image,
      trackNames,
    }
  }

  async getUserInfo(input: { username: string }): Promise<LastFmUserInfo | null> {
    const response = await this.call('user.getInfo', userInfoResponseSchema, {
      user: input.username,
    })
    if (response?.user === undefined) return null

    return {
      url: response.user.url ?? null,
      imageUrl: response.user.image,
      playcount: response.user.playcount ?? 0,
      trackCount: response.user.track_count ?? 0,
      artistCount: response.user.artist_count ?? 0,
      albumCount: response.user.album_count ?? 0,
    }
  }

  async getTopAlbums(input: { username: string; limit: number }): Promise<LastFmTopAlbum[]> {
    const response = await this.call('user.getTopAlbums', topAlbumsResponseSchema, {
      user: input.username,
      limit: String(input.limit),
    })

    return (response?.topalbums?.album ?? []).map((album) => ({
      name: album.name,
      artist: album.artist.name,
      url: album.url ?? null,
      playcount: album.playcount ?? 0,
    }))
  }

  async getTopArtists(input: { username: string; limit: number }): Promise<LastFmTopArtist[]> {
    const response = await this.call('user.getTopArtists', topArtistsResponseSchema, {
      user: input.username,
      limit: String(input.limit),
    })

    return (response?.topartists?.artist ?? []).map((artist) => ({
      name: artist.name,
      url: artist.url ?? null,
      playcount: artist.playcount ?? 0,
    }))
  }

  async getTopTracksPage(input: {
    username: string
    page: number
    limit: number
  }): Promise<LastFmTopTracksPage | null> {
    const response = await this.call('user.getTopTracks', topTracksResponseSchema, {
      user: input.username,
      page: String(input.page),
      limit: String(input.limit),
    })
    if (response?.toptracks === undefined) return null

    return {
      total: response.toptracks['@attr'].total ?? 0,
      tracks: response.toptracks.track.map((track) => ({
        name: track.name,
        artist: track.artist.name,
        url: track.url ?? null,
        playcount: track.playcount ?? 0,
        // user.getTopTracks retorna duração em SEGUNDOS
        durationSeconds:
          track.duration !== null && track.duration > 0 ? Math.round(track.duration) : null,
      })),
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
