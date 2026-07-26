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
  /** Nomes das faixas do álbum (tracklist). */
  readonly trackNames: string[]
}

/** Faixa do ranking do usuário (user.getTopTracks). */
export interface LastFmTopTrack {
  readonly name: string
  readonly artist: string
  readonly url: string | null
  readonly playcount: number
  /** Duração em SEGUNDOS (user.getTopTracks já retorna em s). */
  readonly durationSeconds: number | null
}

/** Página do ranking de faixas do usuário. */
export interface LastFmTopTracksPage {
  readonly tracks: LastFmTopTrack[]
  /** Total de faixas rankeadas (para paginar). */
  readonly total: number
}

/** Faixa do histórico recente (user.getRecentTracks). */
export interface LastFmRecentTrack {
  readonly name: string
  readonly artist: string
  readonly url: string | null
  readonly nowPlaying: boolean
}

/** Perfil do usuário (user.getInfo). */
export interface LastFmUserInfo {
  readonly url: string | null
  readonly imageUrl: string | null
  readonly playcount: number
  readonly trackCount: number
  readonly artistCount: number
  readonly albumCount: number
}

/** Álbum rankeado (user.getTopAlbums). */
export interface LastFmTopAlbum {
  readonly name: string
  readonly artist: string
  readonly url: string | null
  readonly playcount: number
}

/** Artista rankeado (user.getTopArtists). */
export interface LastFmTopArtist {
  readonly name: string
  readonly url: string | null
  readonly playcount: number
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

  getTopTracksPage(input: {
    username: string
    page: number
    limit: number
  }): Promise<LastFmTopTracksPage | null>

  getRecentTracksPage(input: {
    username: string
    limit: number
    page: number
  }): Promise<LastFmRecentTrack[]>

  getUserInfo(input: { username: string }): Promise<LastFmUserInfo | null>

  getTopAlbums(input: { username: string; limit: number }): Promise<LastFmTopAlbum[]>

  getTopArtists(input: { username: string; limit: number }): Promise<LastFmTopArtist[]>
}
