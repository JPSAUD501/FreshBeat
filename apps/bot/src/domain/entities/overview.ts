import type { LastFmTopTrack } from '../ports/lastfm-api.js'

/** Visão enriquecida do álbum ou artista da faixa atual. */
export interface EntityOverview {
  readonly username: string
  readonly nowPlaying: boolean
  /** Nome do álbum ou do artista. */
  readonly name: string
  /** Artista do álbum (ou o próprio nome, para artista). */
  readonly artistName: string
  readonly imageUrl: string | null
  readonly lastfmUrl: string | null
  readonly scrobbles: number | null
  readonly spotifyUrl: string | null
  readonly deezerUrl: string | null
  /** Faixas do usuário nesse álbum/artista, ordenadas por plays (todas, não só o top exibido). */
  readonly topTracks: LastFmTopTrack[]
  readonly playtimeSeconds: number | null
  /** True quando parte das durações foi estimada. */
  readonly playtimeApproximate: boolean
}
