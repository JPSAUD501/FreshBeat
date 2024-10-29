import { type ArtistInfoRequest, type ArtistInfoResponse, ArtistInfoResponseSchema } from './artist.dto.ts'

export class Artist {
  constructor(
    private readonly apiKey: string,
  ) {}

  async getInfo(props: ArtistInfoRequest): Promise<ArtistInfoResponse> {
    const method = 'artist.getinfo'
    const parameters = {
      api_key: this.apiKey,
      artist: props.artist,
      ...(props.mbid && { mbid: props.mbid }),
      ...(props.username && { username: props.username }),
      method,
      format: 'json'
    }
    const queryParameters = new URLSearchParams(parameters).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${queryParameters}`)
    const data = await response.json()
    const parsedData = ArtistInfoResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify({
        message: 'Error parsing response',
        errors: parsedData.error.formErrors,
        receivedData: data,
        requestParameters: parameters,
      }, null, 2))
    }
    return parsedData.data
  }
}
