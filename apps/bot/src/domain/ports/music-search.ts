/** Resultado de busca de faixa em um serviço de streaming. */
export interface MusicSearchResult {
  /** URL pública da faixa no serviço. */
  readonly url: string
  readonly explicit: boolean
  /** Popularidade 0–100 quando o serviço expõe (Spotify). */
  readonly popularity: number | null
  /** Duração em segundos, quando exposta. */
  readonly durationSeconds: number | null
}

/**
 * Port de busca em serviços de música (Spotify, Deezer).
 * Falhas de busca retornam null — nunca derrubam o fluxo principal.
 */
export interface MusicSearchProvider {
  /** Id estável do serviço, ex.: "spotify", "deezer". */
  readonly id: string
  searchTrack(input: { track: string; artist: string }): Promise<MusicSearchResult | null>
  /** URL pública do álbum, ou null. */
  searchAlbum(input: { album: string; artist: string }): Promise<string | null>
  /** URL pública do artista, ou null. */
  searchArtist(input: { artist: string }): Promise<string | null>
}
