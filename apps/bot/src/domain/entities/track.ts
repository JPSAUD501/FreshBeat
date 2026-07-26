/** Referência mínima de uma faixa para buscas. */
export interface TrackRef {
  readonly name: string
  readonly artist: string
  readonly album?: string
  readonly durationSeconds?: number
}

/** Faixa com contexto de reprodução (vem do Last.fm). */
export interface PlayingTrack extends TrackRef {
  readonly nowPlaying: boolean
}
