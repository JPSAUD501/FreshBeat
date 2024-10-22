import { z } from 'zod'

export type LastFmUserGetInfoRequest = z.infer<typeof LastFmUserGetInfoRequestSchema>
export type LastFmUserGetInfoResponse = z.infer<typeof LastFmUserGetInfoResponseSchema>
export type LastFmUserGetRecentTracksRequest = z.infer<typeof LastFmUserGetRecentTracksRequestSchema>
export type LastFmUserGetRecentTracksResponse = z.infer<typeof LastFmUserGetRecentTracksResponseSchema>
export type LastFmUserGetTopAlbumsRequest = z.infer<typeof LastFmUserGetTopAlbumsRequestSchema>
export type LastFmUserGetTopAlbumsResponse = z.infer<typeof LastFmUserGetTopAlbumsResponseSchema>
export type LastFmUserGetTopArtistsRequest = z.infer<typeof LastFmUserGetTopArtistsRequestSchema>
export type LastFmUserGetTopArtistsResponse = z.infer<typeof LastFmUserGetTopArtistsResponseSchema>
export type LastFmUserGetTopTracksRequest = z.infer<typeof LastFmUserGetTopTracksRequestSchema>
export type LastFmUserGetTopTracksResponse = z.infer<typeof LastFmUserGetTopTracksResponseSchema>
export type LastFmUserGetTopTagsRequest = z.infer<typeof LastFmUserGetTopTagsRequestSchema>
export type LastFmUserGetTopTagsResponse = z.infer<typeof LastFmUserGetTopTagsResponseSchema>

export const LastFmUserGetInfoRequestSchema = z.object({
  username: z.string(),
})

export const LastFmUserGetInfoResponseSchema = z.object({
  user: z.object({
    name: z.string(),
    age: z.string(),
    subscriber: z.string(),
    realname: z.string(),
    bootstrap: z.string(),
    playcount: z.string(),
    artist_count: z.string(),
    playlists: z.string(),
    track_count: z.string(),
    album_count: z.string(),
    image: z.array(
      z.object({
        size: z.string(),
        '#text': z.string(),
      }),
    ),
    registered: z.object({
      unixtime: z.string(),
      '#text': z.number(),
    }),
    country: z.string(),
    gender: z.string(),
    url: z.string(),
    type: z.string(),
  }),
})

export const LastFmUserGetRecentTracksRequestSchema = z.object({
  username: z.string(),
  limit: z.string(),
  page: z.string(),
})

export const LastFmUserGetRecentTracksResponseSchema = z.object({
  recenttracks: z.object({
    track: z.array(
      z.object({
        artist: z.object({
          url: z.string(),
          name: z.string(),
          image: z.array(
            z.object({
              size: z.string(),
              '#text': z.string(),
            }),
          ),
          mbid: z.string(),
        }),
        date: z.object({
          uts: z.string(),
          '#text': z.string(),
        }).optional(),
        mbid: z.string(),
        name: z.string(),
        image: z.array(
          z.object({
            size: z.string(),
            '#text': z.string(),
          }),
        ),
        streamable: z.string(),
        album: z.object({
          mbid: z.string(),
          '#text': z.string(),
        }),
        url: z.string(),
        '@attr': z.object({
          nowplaying: z.string(),
        }).optional(),
        loved: z.string(),
      }),
    ),
    '@attr': z.object({
      perPage: z.string(),
      totalPages: z.string(),
      page: z.string(),
      user: z.string(),
      total: z.string(),
    }),
  }),
})

export const LastFmUserGetTopAlbumsRequestSchema = z.object({
  username: z.string(),
  limit: z.string(),
  page: z.string(),
})

export const LastFmUserGetTopAlbumsResponseSchema = z.object({
  topalbums: z.object({
    album: z.array(
      z.object({
        artist: z.object({
          url: z.string(),
          name: z.string(),
          mbid: z.string(),
        }),
        image: z.array(
          z.object({
            size: z.string(),
            '#text': z.string(),
          }),
        ),
        mbid: z.string(),
        url: z.string(),
        playcount: z.string(),
        '@attr': z.object({
          rank: z.string(),
        }),
        name: z.string(),
      }),
    ),
    '@attr': z.object({
      user: z.string(),
      totalPages: z.string(),
      page: z.string(),
      total: z.string(),
      perPage: z.string(),
    }),
  }),
})

export const LastFmUserGetTopArtistsRequestSchema = z.object({
  username: z.string(),
  limit: z.string(),
  page: z.string(),
})

export const LastFmUserGetTopArtistsResponseSchema = z.object({
  topartists: z.object({
    artist: z.array(
      z.object({
        streamable: z.string(),
        image: z.array(
          z.object({
            size: z.string(),
            '#text': z.string(),
          }),
        ),
        mbid: z.string(),
        url: z.string(),
        playcount: z.string(),
        '@attr': z.object({
          rank: z.string(),
        }),
        name: z.string(),
      }),
    ),
    '@attr': z.object({
      user: z.string(),
      totalPages: z.string(),
      page: z.string(),
      perPage: z.string(),
      total: z.string(),
    }),
  }),
})

export const LastFmUserGetTopTracksRequestSchema = z.object({
  username: z.string(),
  limit: z.string(),
  page: z.string(),
})

export const LastFmUserGetTopTracksResponseSchema = z.object({
  toptracks: z.object({
    track: z.array(
      z.object({
        streamable: z.object({
          fulltrack: z.string(),
          '#text': z.string(),
        }),
        mbid: z.string(),
        name: z.string(),
        image: z.array(
          z.object({
            size: z.string(),
            '#text': z.string(),
          }),
        ),
        artist: z.object({
          url: z.string(),
          name: z.string(),
          mbid: z.string(),
        }),
        url: z.string(),
        duration: z.string(),
        '@attr': z.object({
          rank: z.string(),
        }),
        playcount: z.string(),
      }),
    ),
    '@attr': z.object({
      user: z.string(),
      totalPages: z.string(),
      page: z.string(),
      total: z.string(),
      perPage: z.string(),
    }),
  }),
})

export const LastFmUserGetTopTagsRequestSchema = z.object({
  username: z.string(),
  limit: z.string(),
  page: z.string(),
})

export const LastFmUserGetTopTagsResponseSchema = z.object({
  toptags: z.object({
    tag: z.array(
      z.object({
        name: z.string(),
        count: z.string(),
        url: z.string(),
      }),
    ),
    '@attr': z.object({
      user: z.string(),
    }),
  }),
})
