import { Auth } from '../auth/auth.service.ts'
import { SearchTrackResponseSchema } from './search.dto.ts'
import { SearchTrackRequest, SearchTrackResponse } from './search.dto.ts'

export class Search {
  constructor(private readonly auth: Auth) {}

  async track(props: SearchTrackRequest): Promise<SearchTrackResponse> {
    const query = [props.artistName, props.trackName].filter(Boolean).join(' ')
    const clientId = await this.auth.getClientId()
    const url = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&client_id=${clientId}&limit=${props.limit}`
    const fetchResponse = await fetch(url)
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch SoundCloud API')
    }
    const data = await fetchResponse.json()
    const parsedData = SearchTrackResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
          errors: parsedData.error.formErrors,
          receivedData: data,
          requestParameters: props,
        },
        null,
        2,
      ))
    }
    return parsedData.data
  }
}
