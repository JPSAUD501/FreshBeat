import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import type { LyricsProvider } from '../../domain/ports/lyrics-provider.js'
import { LrclibApiClient, toLyrics } from './lrclib-api.js'

/**
 * lrcmux (https://api.lrcmux.dev) — agregador que faz fanout para
 * genius, kugou, musixmatch, netease e ytmusic e escolhe o melhor.
 * Usamos o endpoint de compatibilidade LRCLIB para compartilhar
 * o cliente com o LRCLIB.
 */
export class LrcmuxProvider implements LyricsProvider {
  readonly source = { id: 'lrcmux', name: 'lrcmux' } as const
  private readonly client = new LrclibApiClient('https://api.lrcmux.dev', '/compat/lrclib/api/get')

  async search(track: TrackRef): Promise<Lyrics | null> {
    const response = await this.client.get(track)
    return response === null ? null : toLyrics(response, this.source)
  }
}
