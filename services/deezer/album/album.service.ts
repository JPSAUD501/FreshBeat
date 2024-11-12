import { DeezerAlbumSearchRequest, DeezerAlbumSearchResponse, DeezerAlbumSearchResponseSchema } from './album.dto.ts'

export class Album {
  async search(props: DeezerAlbumSearchRequest): Promise<DeezerAlbumSearchResponse> {
    const query = `album:"${props.album}"`
    const url = `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=${props.limit}`
    const response = await fetch(url)
    const data = await response.json()
    const parsed = DeezerAlbumSearchResponseSchema.parse(data)
    return parsed
  }
}
