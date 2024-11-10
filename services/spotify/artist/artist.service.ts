import { SpotifyArtistInfoRequest } from './artist.dto.ts'
import * as Soundify from '@soundify/web-api'

export class Artist {
  constructor(private readonly client: Soundify.SpotifyClient) {}

  async getArtistInfo(props: SpotifyArtistInfoRequest): Promise<Soundify.Artist[]> {
    const result = await Soundify.search(this.client, 'artist', props.artist, {
      limit: props.limit ?? 5,
    })
    return result.artists.items
  }
}
