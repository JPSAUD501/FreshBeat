import { type AlbumInfoRequest, type AlbumInfoResponse, AlbumInfoResponseSchema } from './album.dto.ts'

export class Album {
  constructor(
    private readonly apiKey: string,
  ) {}

  async getInfo(props: AlbumInfoRequest): Promise<AlbumInfoResponse> {
    const method = 'album.getinfo'
    const parameters = {
      api_key: this.apiKey,
      artist: props.artist,
      album: props.album,
      ...(props.mbid && { mbid: props.mbid }),
      ...(props.username && { username: props.username }),
      method,
      format: 'json',
    }
    const queryParameters = new URLSearchParams(parameters).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${queryParameters}`)
    const data = await response.json()
    const parsed = AlbumInfoResponseSchema.parse(data)
    return parsed
  }
}
