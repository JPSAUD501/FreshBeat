import { Auth } from './auth/auth.service.ts'
import { Track } from './track/track.service.ts'
import { Artist } from './artist/artist.service.ts'
import { Album } from './album/album.service.ts'
import { config } from '../../config.ts'

export class SpotifyService {
  readonly auth: Auth
  readonly track: Track
  readonly artist: Artist
  readonly album: Album

  constructor() {
    this.auth = new Auth(config.SPOTIFY_CLIENT_ID, config.SPOTIFY_CLIENT_SECRET)
    const client = this.auth.spotifyClient
    this.track = new Track(client)
    this.artist = new Artist(client)
    this.album = new Album(client)
  }
}
