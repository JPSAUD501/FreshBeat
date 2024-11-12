import { Track } from './track/track.service.ts'
import { Artist } from './artist/artist.service.ts'
import { Album } from './album/album.service.ts'

export class DeezerService {
  readonly track: Track
  readonly artist: Artist
  readonly album: Album

  constructor() {
    this.track = new Track()
    this.artist = new Artist()
    this.album = new Album()
  }
}
