import { z } from 'zod'

export type AlbumInfoRequest = z.infer<typeof AlbumInfoRequestSchema>
export type AlbumInfoResponse = z.infer<typeof AlbumInfoResponseSchema>

const zodTrack = z.object({
  streamable: z.object({ fulltrack: z.string(), '#text': z.string() }),
  duration: z.number().nullable(),
  url: z.string(),
  name: z.string(),
  '@attr': z.object({ rank: z.number() }),
  artist: z.object({
    url: z.string(),
    name: z.string(),
    mbid: z.string().optional()
  })
})

export const AlbumInfoRequestSchema = z.object({
  artist: z.string(),
  album: z.string(),
  mbid: z.string().optional(),
  username: z.string().optional(),
})

export const AlbumInfoResponseSchema = z.object({
  album: z.object({
    artist: z.string(),
    mbid: z.string().optional(),
    tags: z.object({
      tag: z.array(z.object({ url: z.string(), name: z.string() }))
    }).or(z.string()).optional(),
    name: z.string(),
    image: z.array(z.object({ size: z.string(), '#text': z.string() })),
    tracks: z.object({
      track: z.array(zodTrack).or(zodTrack)
    }).optional(),
    url: z.string(),
    listeners: z.string(),
    playcount: z.string(),
    userplaycount: z.number().optional(),
    wiki: z.object({
      published: z.string(),
      summary: z.string(),
      content: z.string()
    }).optional()
  })
})
