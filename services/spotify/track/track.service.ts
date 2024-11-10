import { SpotifyTrackInfoRequest } from './track.dto.ts'
import * as Soundify from '@soundify/web-api'

export class Track {
  constructor(private readonly client: Soundify.SpotifyClient) {}

  async getTrackInfo(props: SpotifyTrackInfoRequest): Promise<Soundify.Track[]> {
    const result = await Soundify.search(this.client, 'track', `${props.track} ${props.artist}`, {
      limit: props.limit ?? 5,
    })
    return result.tracks.items
  }
}
