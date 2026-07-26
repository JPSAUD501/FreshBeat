import { z } from 'zod'
import type { PlayingTrack } from '../../domain/entities/track.js'
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

/**
 * Last.fm API (https://www.last.fm/api). Por enquanto só o necessário
 * para "tocando agora"; a Fase 5 expande para stats completos.
 */
export class LastFmClient implements RecentTracksProvider {
  private readonly baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  constructor(private readonly apiKey: string) {}

  async getMostRecentTrack(lastfmUsername: string): Promise<PlayingTrack | null> {
    const params = new URLSearchParams({
      method: 'user.getRecentTracks',
      user: lastfmUsername,
      api_key: this.apiKey,
      format: 'json',
      limit: '1',
      extended: '1',
    })
    const response = await fetchJson(
      `${this.baseUrl}?${params.toString()}`,
      recentTracksResponseSchema,
    )
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
}
