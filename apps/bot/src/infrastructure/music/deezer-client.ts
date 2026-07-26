import { z } from 'zod'
import type { MusicSearchProvider, MusicSearchResult } from '../../domain/ports/music-search.js'
import { fetchJson } from '../http/fetch-json.js'

const searchResponseSchema = z.object({
  data: z.array(
    z.object({
      link: z.string(),
      duration: z.number(),
      explicit_lyrics: z.boolean().optional(),
    }),
  ),
})

const linkSearchResponseSchema = z.object({
  data: z.array(z.object({ link: z.string() })),
})

/** Deezer API pública de busca (sem autenticação). */
export class DeezerClient implements MusicSearchProvider {
  readonly id = 'deezer'

  async searchTrack(input: { track: string; artist: string }): Promise<MusicSearchResult | null> {
    const query = new URLSearchParams({
      q: `track:"${input.track}" artist:"${input.artist}"`,
      limit: '1',
    })
    const response = await fetchJson(
      `https://api.deezer.com/search/track?${query.toString()}`,
      searchResponseSchema,
    )
    const item = response?.data[0]
    if (item === undefined) return null

    return {
      url: item.link,
      explicit: item.explicit_lyrics ?? false,
      popularity: null,
      durationSeconds: item.duration,
    }
  }

  async searchAlbum(input: { album: string; artist: string }): Promise<string | null> {
    const query = new URLSearchParams({ q: `${input.album} ${input.artist}`, limit: '1' })
    const response = await fetchJson(
      `https://api.deezer.com/search/album?${query.toString()}`,
      linkSearchResponseSchema,
    )
    return response?.data[0]?.link ?? null
  }

  async searchArtist(input: { artist: string }): Promise<string | null> {
    const query = new URLSearchParams({ q: input.artist, limit: '1' })
    const response = await fetchJson(
      `https://api.deezer.com/search/artist?${query.toString()}`,
      linkSearchResponseSchema,
    )
    return response?.data[0]?.link ?? null
  }
}
