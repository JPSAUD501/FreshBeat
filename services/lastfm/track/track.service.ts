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
    const parsedData = LastFmTrackInfoResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing track info response',
          errors: parsedData.error.formErrors,
          receivedData: data,
          requestParameters: parameters,
        },
        null,
        2,
      ))
    }
    return parsedData.data
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
    const parsedData = LastFmTrackSearchResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing track search response',
          errors: parsedData.error.formErrors,
          receivedData: data,
          requestParameters: parameters,
        },
        null,
        2,
      ))
    }
    return parsedData.data
  }
}
