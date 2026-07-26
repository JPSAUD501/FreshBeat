import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { LyricsProvider } from '../../domain/ports/lyrics-provider.js'
import { LrclibApiClient, toLyrics } from './lrclib-api.js'

/** LRCLIB (https://lrclib.net) — banco colaborativo de letras. */
export class LrclibProvider implements LyricsProvider {
  readonly source = { id: 'lrclib', name: 'LRCLIB' } as const
  private readonly client = new LrclibApiClient('https://lrclib.net', '/api/get')

  async search(track: TrackRef): Promise<Lyrics | null> {
    const response = await this.client.get(track)
    return response === null ? null : toLyrics(response, this.source)
  }
}
