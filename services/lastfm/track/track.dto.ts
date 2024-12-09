import { z } from 'zod'

export type LastFmTrackSearchRequest = z.infer<typeof LastFmTrackSearchRequestSchema>
export type LastFmTrackSearchResponse = z.infer<typeof LastFmTrackSearchResponseSchema>
export type LastFmTrackInfoRequest = z.infer<typeof LastFmTrackInfoRequestSchema>
export type LastFmTrackInfoResponse = z.infer<typeof LastFmTrackInfoResponseSchema>

export const LastFmTrackSearchRequestSchema = z.object({
  track: z.string(),
  limit: z.string().optional(),
  page: z.string().optional(),
})

export const LastFmTrackSearchResponseSchema = z.object({
  results: z.object({
    'opensearch:Query': z.object({
      '#text': z.string(),
      role: z.string(),
      startPage: z.string(),
    }),
    'opensearch:totalResults': z.string(),
    'opensearch:startIndex': z.string(),
    'opensearch:itemsPerPage': z.string(),
    trackmatches: z.object({
      track: z.array(
        z.object({
          name: z.string(),
          artist: z.string(),
          url: z.string(),
          streamable: z.string(),
          listeners: z.string(),
          image: z.array(z.object({ '#text': z.string(), size: z.string() })),
          mbid: z.string().optional(),
        }),
      ),
    }),
    '@attr': z.object({}),
  }),
})

export const LastFmTrackInfoRequestSchema = z.object({
  username: z.string().optional(),
  track: z.string(),
  artist: z.string(),
  mbid: z.string().optional(),
})

export const LastFmTrackInfoResponseSchema = z.object({
  track: z.object({
    name: z.string(),
    mbid: z.string().optional(),
    url: z.string(),
    duration: z.string(),
    streamable: z.object({
      '#text': z.string(),
      fulltrack: z.string(),
    }),
    listeners: z.string(),
    playcount: z.string(),
    artist: z.object({
      name: z.string(),
      mbid: z.string().optional(),
      url: z.string(),
    }),
    album: z.object({
      artist: z.string(),
      title: z.string(),
      mbid: z.string().optional(),
      url: z.string(),
      image: z.array(z.object({ '#text': z.string(), size: z.string() })),
      '@attr': z.object({ position: z.string() }).optional(),
    }).optional(),
    userplaycount: z.string().optional(),
    userloved: z.string().optional(),
    toptags: z.object({
      tag: z.array(z.object({ name: z.string(), url: z.string() })),
    }),
    wiki: z.object({
      published: z.string(),
      summary: z.string(),
      content: z.string(),
    }).optional(),
  }),
})
