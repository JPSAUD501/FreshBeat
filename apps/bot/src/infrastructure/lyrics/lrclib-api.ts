import { z } from 'zod'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import { fetchJson } from '../http/fetch-json.js'

/**
 * Contrato do LRCLIB (`GET /api/get`). O lrcmux expõe o mesmo contrato
 * em `/compat/lrclib/api/get`, então este cliente serve aos dois.
 */
export const lrclibGetResponseSchema = z.object({
  id: z.number(),
  trackName: z.string(),
  artistName: z.string(),
  albumName: z.string().optional(),
  duration: z.number().optional(),
  instrumental: z.boolean(),
  plainLyrics: z.string().nullable(),
  syncedLyrics: z.string().nullable(),
})

export type LrclibGetResponse = z.infer<typeof lrclibGetResponseSchema>

export class LrclibApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getPath: string,
  ) {}

  async get(track: TrackRef): Promise<LrclibGetResponse | null> {
    const params = new URLSearchParams({
      track_name: track.name,
      artist_name: track.artist,
    })
    if (track.album !== undefined) params.set('album_name', track.album)
    if (track.durationSeconds !== undefined) {
      params.set('duration', String(Math.round(track.durationSeconds)))
    }
    const url = `${this.baseUrl}${this.getPath}?${params.toString()}`
    return fetchJson(url, lrclibGetResponseSchema)
  }
}

export function toLyrics(
  response: LrclibGetResponse,
  source: { id: string; name: string },
): Lyrics | null {
  const plain = response.plainLyrics?.trim() ?? ''
  const synced = response.syncedLyrics?.trim() ?? null

  // Sem letra nenhuma e não instrumental: trata como miss
  if (!response.instrumental && plain === '' && synced === null) return null

  return {
    trackName: response.trackName,
    artistName: response.artistName,
    plainLyrics: plain,
    syncedLyrics: synced === '' ? null : synced,
    instrumental: response.instrumental,
    source,
  }
}
