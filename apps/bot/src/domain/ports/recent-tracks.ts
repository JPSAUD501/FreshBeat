import type { PlayingTrack } from '../entities/track.js'

/** Port da fonte de "tocando agora" (Last.fm). */
export interface RecentTracksProvider {
  /** Faixa mais recente do usuário, ou null se não houver nada tocando/ouvido. */
  getMostRecentTrack(lastfmUsername: string): Promise<PlayingTrack | null>
}
