import { Auth } from './auth/auth.service.ts'
import { Track } from './track/track.service.ts'
import { Artist } from './artist/artist.service.ts'
import { Album } from './album/album.service.ts'

export class SpotifyService {
  readonly auth: Auth
  readonly track: Track
  readonly artist: Artist
  readonly album: Album

  constructor(clientID: string, clientSecret: string) {
    this.auth = new Auth(clientID, clientSecret)
    const client = this.auth.spotifyClient
    this.track = new Track(client)
    this.artist = new Artist(client)
    this.album = new Album(client)
  }
}
