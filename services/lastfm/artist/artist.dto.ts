import { z } from 'zod'

export type ArtistInfoRequest = z.infer<typeof ArtistInfoRequestSchema>
export type ArtistInfoResponse = z.infer<typeof ArtistInfoResponseSchema>

export const ArtistInfoRequestSchema = z.object({
  artist: z.string(),
  mbid: z.string().optional(),
  username: z.string().optional(),
})

export const ArtistInfoResponseSchema = z.object({
  artist: z.object({
    name: z.string(),
    mbid: z.string().optional(),
    url: z.string(),
    image: z.array(z.object({ '#text': z.string(), size: z.string() })),
    streamable: z.string(),
    ontour: z.string(),
    stats: z.object({
      listeners: z.string(),
      playcount: z.string(),
      userplaycount: z.string().optional(),
    }),
    similar: z.object({
      artist: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
          image: z.array(z.object({ '#text': z.string(), size: z.string() })),
        }),
      ),
    }),
    tags: z.object({
      tag: z.array(z.object({ name: z.string(), url: z.string() })),
    }),
    bio: z.object({
      links: z.object({
        link: z.object({
          '#text': z.string(),
          rel: z.string(),
          href: z.string(),
        }),
      }),
      published: z.string(),
      summary: z.string(),
      content: z.string(),
    }),
  }),
})
