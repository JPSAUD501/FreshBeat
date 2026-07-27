import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import { z } from 'zod'

/**
 * Client Last.fm do site (métodos de leitura — sem assinatura).
 * Toda resposta é validada com zod e qualquer falha degrada para
 * `null` — o dashboard mostra empty states em vez de quebrar.
 */

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

/** Períodos suportados nas abas de stats do dashboard. */
export type LastfmPeriod = '7day' | '1month' | 'overall'
export const LASTFM_PERIODS: readonly LastfmPeriod[] = ['7day', '1month', 'overall']

const TTL = {
  recentTracks: 30,
  tops: 300,
  userInfo: 300,
} as const

// ---------- Tipos de domínio ----------

export interface LastfmUserStats {
  scrobbles: number
  artists: number
  albums: number
  tracks: number
}

export interface RecentTrack {
  name: string
  artist: string
  album: string | null
  image: string | null
  url: string | null
  /** null quando está tocando agora (a API não manda date nesse caso). */
  playedAt: Date | null
  nowPlaying: boolean
}

export interface TopTrack {
  name: string
  artist: string
  playcount: number
  durationSeconds: number | null
  image: string | null
  url: string | null
}

export interface TopArtist {
  name: string
  playcount: number
  image: string | null
  url: string | null
}

export interface TopAlbum {
  name: string
  artist: string
  playcount: number
  image: string | null
  url: string | null
}

// ---------- Schemas zod ----------

const imagesSchema = z.array(z.object({ '#text': z.string(), size: z.string() })).catch([])

function pickImage(images: z.infer<typeof imagesSchema>): string | null {
  const bySize = new Map(images.map((image) => [image.size, image['#text']]))
  for (const size of ['extralarge', 'large', 'medium', 'small']) {
    const url = bySize.get(size)
    if (url !== undefined && url !== '') return url
  }
  return null
}

const recentTracksSchema = z.object({
  recenttracks: z.object({
    track: z
      .array(
        z.object({
          name: z.string(),
          artist: z.object({ '#text': z.string() }),
          album: z.object({ '#text': z.string() }).optional(),
          image: imagesSchema.optional(),
          url: z.string().optional(),
          date: z.object({ uts: z.string() }).optional(),
          '@attr': z.object({ nowplaying: z.string().optional() }).optional(),
        }),
      )
      .catch([]),
  }),
})

const topTracksSchema = z.object({
  toptracks: z.object({
    track: z
      .array(
        z.object({
          name: z.string(),
          artist: z.object({ name: z.string() }),
          playcount: z.coerce.number().catch(0),
          duration: z.coerce.number().optional(),
          image: imagesSchema.optional(),
          url: z.string().optional(),
        }),
      )
      .catch([]),
  }),
})

const topArtistsSchema = z.object({
  topartists: z.object({
    artist: z
      .array(
        z.object({
          name: z.string(),
          playcount: z.coerce.number().catch(0),
          image: imagesSchema.optional(),
          url: z.string().optional(),
        }),
      )
      .catch([]),
  }),
})

const topAlbumsSchema = z.object({
  topalbums: z.object({
    album: z
      .array(
        z.object({
          name: z.string(),
          artist: z.object({ name: z.string() }),
          playcount: z.coerce.number().catch(0),
          image: imagesSchema.optional(),
          url: z.string().optional(),
        }),
      )
      .catch([]),
  }),
})

const userInfoSchema = z.object({
  user: z.object({
    playcount: z.coerce.number().catch(0),
    artist_count: z.coerce.number().catch(0),
    album_count: z.coerce.number().catch(0),
    track_count: z.coerce.number().catch(0),
  }),
})

// ---------- Fetch base ----------

export interface LastfmClientOptions {
  apiKey: string
  /** Quando presente, respostas são cacheadas com os TTLs acima. */
  cache?: CacheStore
}

async function callApi<S extends z.ZodTypeAny>(
  options: LastfmClientOptions,
  method: string,
  params: Record<string, string>,
  schema: S,
  ttlSeconds: number,
): Promise<z.output<S> | null> {
  const loader = async (): Promise<z.output<S> | null> => {
    const search = new URLSearchParams({
      method,
      api_key: options.apiKey,
      format: 'json',
      ...params,
    })
    try {
      const response = await fetch(`${LASTFM_API_URL}?${search.toString()}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) return null
      const parsed = schema.safeParse(await response.json())
      return parsed.success ? parsed.data : null
    } catch {
      return null
    }
  }

  if (options.cache === undefined) return loader()
  const key = cacheKey('web:lastfm', method, ...Object.values(params))
  return getOrSet(options.cache, key, ttlSeconds, loader)
}

// ---------- Métodos públicos ----------

/** Stats gerais do perfil (user.getInfo). */
export async function getUserStats(
  options: LastfmClientOptions,
  username: string,
): Promise<LastfmUserStats | null> {
  const data = await callApi(
    options,
    'user.getInfo',
    { user: username },
    userInfoSchema,
    TTL.userInfo,
  )
  if (data === null) return null
  return {
    scrobbles: data.user.playcount,
    artists: data.user.artist_count,
    albums: data.user.album_count,
    tracks: data.user.track_count,
  }
}

/** Faixas recentes, mais nova primeiro (user.getRecentTracks). */
export async function getRecentTracks(
  options: LastfmClientOptions,
  username: string,
  limit = 10,
): Promise<RecentTrack[] | null> {
  const data = await callApi(
    options,
    'user.getRecentTracks',
    { user: username, limit: String(limit) },
    recentTracksSchema,
    TTL.recentTracks,
  )
  if (data === null) return null
  return data.recenttracks.track.map((track) => ({
    name: track.name,
    artist: track.artist['#text'],
    album: track.album !== undefined && track.album['#text'] !== '' ? track.album['#text'] : null,
    image: track.image !== undefined ? pickImage(track.image) : null,
    url: track.url ?? null,
    playedAt: track.date !== undefined ? new Date(Number(track.date.uts) * 1000) : null,
    nowPlaying: track['@attr']?.nowplaying === 'true',
  }))
}

/** Top faixas do período (user.getTopTracks). */
export async function getTopTracks(
  options: LastfmClientOptions,
  username: string,
  period: LastfmPeriod,
  limit = 10,
): Promise<TopTrack[] | null> {
  const data = await callApi(
    options,
    'user.getTopTracks',
    { user: username, period, limit: String(limit) },
    topTracksSchema,
    TTL.tops,
  )
  if (data === null) return null
  return data.toptracks.track.map((track) => ({
    name: track.name,
    artist: track.artist.name,
    playcount: track.playcount,
    durationSeconds: track.duration !== undefined && track.duration > 0 ? track.duration : null,
    image: track.image !== undefined ? pickImage(track.image) : null,
    url: track.url ?? null,
  }))
}

/** Top artistas do período (user.getTopArtists). */
export async function getTopArtists(
  options: LastfmClientOptions,
  username: string,
  period: LastfmPeriod,
  limit = 10,
): Promise<TopArtist[] | null> {
  const data = await callApi(
    options,
    'user.getTopArtists',
    { user: username, period, limit: String(limit) },
    topArtistsSchema,
    TTL.tops,
  )
  if (data === null) return null
  return data.topartists.artist.map((artist) => ({
    name: artist.name,
    playcount: artist.playcount,
    image: artist.image !== undefined ? pickImage(artist.image) : null,
    url: artist.url ?? null,
  }))
}

/** Top álbuns do período (user.getTopAlbums). */
export async function getTopAlbums(
  options: LastfmClientOptions,
  username: string,
  period: LastfmPeriod,
  limit = 10,
): Promise<TopAlbum[] | null> {
  const data = await callApi(
    options,
    'user.getTopAlbums',
    { user: username, period, limit: String(limit) },
    topAlbumsSchema,
    TTL.tops,
  )
  if (data === null) return null
  return data.topalbums.album.map((album) => ({
    name: album.name,
    artist: album.artist.name,
    playcount: album.playcount,
    image: album.image !== undefined ? pickImage(album.image) : null,
    url: album.url ?? null,
  }))
}
