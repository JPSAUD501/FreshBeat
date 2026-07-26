export interface LyricsSource {
  /** Id estável do provedor, ex.: "lrcmux", "lrclib", "lyricsovh". */
  readonly id: string
  /** Nome amigável exibido ao usuário, ex.: "LRCLIB". */
  readonly name: string
}

/** Letra encontrada por um provedor. */
export interface Lyrics {
  readonly trackName: string
  readonly artistName: string
  /** Texto puro com quebras de linha. */
  readonly plainLyrics: string
  /** Letra sincronizada em formato LRC ([mm:ss.xx]), quando disponível. */
  readonly syncedLyrics: string | null
  /** Faixa instrumental (sem letra por natureza). */
  readonly instrumental: boolean
  readonly source: LyricsSource
}
