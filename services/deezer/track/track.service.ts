import { DeezerTrackSearchRequest, DeezerTrackSearchResponse, DeezerTrackSearchResponseSchema } from './track.dto.ts'

export class Track {
  async search(props: DeezerTrackSearchRequest): Promise<DeezerTrackSearchResponse> {
    const queryArray: string[] = []
    if (props.track) queryArray.push(`track:"${props.track}"`)
    if (props.artist) queryArray.push(`artist:"${props.artist}"`)
    const query = queryArray.join(' ')
    const url = `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=${props.limit}`
    const response = await fetch(url)
    const data = await response.json()
    const parsed = DeezerTrackSearchResponseSchema.parse(data)
    return parsed
  }
}
