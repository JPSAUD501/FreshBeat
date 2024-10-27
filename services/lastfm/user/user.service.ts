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
    const parsedData = LastFmUserGetInfoResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
    const parsedData = LastFmUserGetRecentTracksResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
    const parsedData = LastFmUserGetTopAlbumsResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
    const parsedData = LastFmUserGetTopArtistsResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
    const parsedData = LastFmUserGetTopTracksResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
    const parsedData = LastFmUserGetTopTagsResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify(
        {
          message: 'Error parsing response',
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
