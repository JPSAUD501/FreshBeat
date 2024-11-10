import { SpotifyAlbumInfoRequest } from './album.dto.ts'
import * as Soundify from '@soundify/web-api'

export class Album {
  constructor(private readonly client: Soundify.SpotifyClient) {}

  async getAlbumInfo(props: SpotifyAlbumInfoRequest): Promise<Soundify.SimplifiedAlbum[]> {
    const result = await Soundify.search(this.client, 'album', `${props.album} ${props.artist}`, {
      limit: props.limit ?? 5,
    })
    return result.albums.items
  }
}
