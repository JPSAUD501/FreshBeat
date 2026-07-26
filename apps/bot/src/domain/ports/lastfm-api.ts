/** Dados de faixa vindos do track.getInfo do Last.fm. */
export interface LastFmTrackInfo {
  readonly url: string | null
  /** Duração em SEGUNDOS (convertida de ms). */
  readonly durationSeconds: number | null
  readonly userPlaycount: number | null
}

/** Dados de artista vindos do artist.getInfo do Last.fm. */
export interface LastFmArtistInfo {
  readonly url: string | null
  readonly userPlaycount: number | null
  readonly imageUrl: string | null
}

/** Dados de álbum vindos do album.getInfo do Last.fm. */
export interface LastFmAlbumInfo {
  readonly url: string | null
  readonly userPlaycount: number | null
  readonly imageUrl: string | null
}

/**
 * Port da API do Last.fm para dados de faixas/artistas/álbuns
 * com os contadores do usuário (userplaycount).
 */
export interface LastFmApi {
  getTrackInfo(input: {
    track: string
    artist: string
    username: string
  }): Promise<LastFmTrackInfo | null>

  getArtistInfo(input: { artist: string; username: string }): Promise<LastFmArtistInfo | null>

  getAlbumInfo(input: {
    album: string
    artist: string
    username: string
  }): Promise<LastFmAlbumInfo | null>
}
