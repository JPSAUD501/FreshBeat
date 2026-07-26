import { z } from 'zod'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { LyricsProvider } from '../../domain/ports/lyrics-provider.js'
import { fetchJson } from '../http/fetch-json.js'

const lyricsOvhResponseSchema = z.object({ lyrics: z.string() })

/**
 * lyrics.ovh (https://api.lyrics.ovh) — fallback final, só texto puro.
 * Instável em alguns períodos: o timeout do fetchJson protege.
 */
export class LyricsOvhProvider implements LyricsProvider {
  readonly source = { id: 'lyricsovh', name: 'lyrics.ovh' } as const

  async search(track: TrackRef): Promise<Lyrics | null> {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.name)}`
    const response = await fetchJson(url, lyricsOvhResponseSchema)
    if (response === null) return null

    const plain = response.lyrics.trim()
    if (plain === '') return null

    return {
      trackName: track.name,
      artistName: track.artist,
      plainLyrics: plain,
      syncedLyrics: null,
      instrumental: false,
      source: this.source,
    }
  }
}
