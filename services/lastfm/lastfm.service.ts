import { Auth } from './auth/auth.service.ts'
import { User } from './user/user.service.ts'
import { Artist } from './artist/artist.service.ts'
import { Album } from './album/album.service.ts'
import { Track } from './track/track.service.ts'

export class LastFmService {
  private readonly apiKey: string
  private readonly apiSecret: string
  readonly auth: Auth
  readonly user: User
  readonly artist: Artist
  readonly album: Album
  readonly track: Track

  constructor(props: { apiKey: string; apiSecret: string }) {
    this.apiKey = props.apiKey
    this.apiSecret = props.apiSecret
    this.auth = new Auth(this.apiKey, this.apiSecret)
    this.user = new User(this.apiKey)
    this.artist = new Artist(this.apiKey)
    this.album = new Album(this.apiKey)
    this.track = new Track(this.apiKey)
  }
}
