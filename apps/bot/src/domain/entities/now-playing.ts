/** Scrobbles do usuário por escopo (null = dado indisponível). */
export interface Scrobbles {
  readonly track: number | null
  readonly album: number | null
  readonly artist: number | null
}

/** Links externos da faixa (apenas os encontrados). */
export interface TrackLinks {
  readonly lastfmTrack: string | null
  readonly lastfmArtist: string | null
  readonly lastfmAlbum: string | null
  readonly spotify: string | null
  readonly deezer: string | null
}

/** Visão enriquecida da faixa atual/recente do usuário. */
export interface NowPlayingInfo {
  readonly lastfmUsername: string
  readonly nowPlaying: boolean
  readonly trackName: string
  readonly artistName: string
  readonly albumName: string | null
  /** Capa do álbum (maior resolução disponível). */
  readonly imageUrl: string | null
  readonly durationSeconds: number | null
  readonly scrobbles: Scrobbles
  /** Badge de conteúdo explícito (Spotify/Deezer). */
  readonly explicit: boolean
  /** Popularidade 0–100 (Spotify). */
  readonly popularity: number | null
  /** Tempo total que o usuário passou ouvindo ESSA faixa, em segundos. */
  readonly listeningSeconds: number | null
  readonly links: TrackLinks
}
