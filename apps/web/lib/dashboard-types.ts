import type { RecentTrack, TopAlbum, TopArtist, TopTrack } from './lastfm'

/** DTO serializável de faixa recente (playedAt em ISO string). */
export interface RecentTrackDto {
  name: string
  artist: string
  album: string | null
  image: string | null
  url: string | null
  playedAt: string | null
  nowPlaying: boolean
}

export interface PlaytimeDto {
  totalSeconds: number
  /** true quando parte relevante dos plays teve duração estimada. */
  estimated: boolean
}

export interface TopsDto {
  tracks: TopTrack[]
  artists: TopArtist[]
  albums: TopAlbum[]
  playtime: PlaytimeDto
}

export function toRecentTrackDto(track: RecentTrack): RecentTrackDto {
  return {
    name: track.name,
    artist: track.artist,
    album: track.album,
    image: track.image,
    url: track.url,
    playedAt: track.playedAt !== null ? track.playedAt.toISOString() : null,
    nowPlaying: track.nowPlaying,
  }
}
