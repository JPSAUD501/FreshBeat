import { type LastFmTrackInfoRequest, type LastFmTrackInfoResponse, LastFmTrackInfoResponseSchema, type LastFmTrackSearchRequest, type LastFmTrackSearchResponse, LastFmTrackSearchResponseSchema } from './track.dto.ts'

export class Track {
  constructor(
    private readonly apiKey: string,
  ) {}

  async getInfo(props: LastFmTrackInfoRequest): Promise<LastFmTrackInfoResponse> {
    const method = 'track.getInfo'
    const parameters = {
      api_key: this.apiKey,
      artist: props.artist,
      track: props.track,
      ...(props.mbid !== undefined && { mbid: props.mbid }),
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmTrackInfoResponseSchema.parse(data)
    return parsed
  }

  async search(props: LastFmTrackSearchRequest): Promise<LastFmTrackSearchResponse> {
    const method = 'track.search'
    const parameters = {
      api_key: this.apiKey,
      track: props.track,
      ...(props.limit !== undefined && { limit: props.limit }),
      ...(props.page !== undefined && { page: props.page }),
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmTrackSearchResponseSchema.parse(data)
    return parsed
  }
}
