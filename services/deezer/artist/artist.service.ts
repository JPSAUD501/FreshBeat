import { DeezerArtistSearchRequest, DeezerArtistSearchResponse, DeezerArtistSearchResponseSchema } from './artist.dto.ts'

export class Artist {
  async search(props: DeezerArtistSearchRequest): Promise<DeezerArtistSearchResponse> {
    const query = `artist:"${props.artist}"`
    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=${props.limit}`
    const response = await fetch(url)
    const data = await response.json()
    const parsed = DeezerArtistSearchResponseSchema.parse(data)
    return parsed
  }
}
