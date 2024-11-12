import { type LastFmUserGetInfoRequest, type LastFmUserGetInfoResponse, LastFmUserGetInfoResponseSchema, type LastFmUserGetRecentTracksRequest, type LastFmUserGetRecentTracksResponse, LastFmUserGetRecentTracksResponseSchema, type LastFmUserGetTopAlbumsRequest, type LastFmUserGetTopAlbumsResponse, LastFmUserGetTopAlbumsResponseSchema, type LastFmUserGetTopArtistsRequest, type LastFmUserGetTopArtistsResponse, LastFmUserGetTopArtistsResponseSchema, type LastFmUserGetTopTagsRequest, type LastFmUserGetTopTagsResponse, LastFmUserGetTopTagsResponseSchema, type LastFmUserGetTopTracksRequest, type LastFmUserGetTopTracksResponse, LastFmUserGetTopTracksResponseSchema } from './user.dto.ts'

export class User {
  constructor(
    private readonly apiKey: string,
  ) {}

  async getInfo(props: LastFmUserGetInfoRequest): Promise<LastFmUserGetInfoResponse> {
    const method = 'user.getInfo'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetInfoResponseSchema.parse(data)

    return parsed
  }

  async getRecentTracks(props: LastFmUserGetRecentTracksRequest): Promise<LastFmUserGetRecentTracksResponse> {
    const method = 'user.getrecenttracks'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      limit: props.limit,
      page: props.page,
      extended: '1',
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetRecentTracksResponseSchema.parse(data)
    return parsed
  }

  async getTopAlbums(props: LastFmUserGetTopAlbumsRequest): Promise<LastFmUserGetTopAlbumsResponse> {
    const method = 'user.gettopalbums'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      limit: props.limit,
      page: props.page,
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetTopAlbumsResponseSchema.parse(data)
    return parsed
  }

  async getTopArtists(props: LastFmUserGetTopArtistsRequest): Promise<LastFmUserGetTopArtistsResponse> {
    const method = 'user.gettopartists'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      limit: props.limit,
      page: props.page,
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetTopArtistsResponseSchema.parse(data)
    return parsed
  }

  async getTopTracks(props: LastFmUserGetTopTracksRequest): Promise<LastFmUserGetTopTracksResponse> {
    const method = 'user.gettoptracks'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      limit: props.limit,
      page: props.page,
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetTopTracksResponseSchema.parse(data)
    return parsed
  }

  async getTopTags(props: LastFmUserGetTopTagsRequest): Promise<LastFmUserGetTopTagsResponse> {
    const method = 'user.gettoptags'
    const parameters = {
      api_key: this.apiKey,
      user: props.username,
      limit: props.limit,
      method,
    }
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&${queryParameters}`)
    const data = await response.json()
    const parsed = LastFmUserGetTopTagsResponseSchema.parse(data)
    return parsed
  }
}
