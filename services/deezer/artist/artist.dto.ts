import { z } from 'zod'

export type DeezerArtistSearchRequest = z.infer<typeof DeezerArtistSearchRequestSchema>
export type DeezerArtist = z.infer<typeof DeezerArtistSchema>
export type DeezerArtistSearchResponse = z.infer<typeof DeezerArtistSearchResponseSchema>

export const DeezerArtistSearchRequestSchema = z.object({
  artist: z.string(),
  limit: z.number(),
})

export const DeezerArtistSchema = z.object({
  id: z.number(),
  name: z.string(),
  link: z.string(),
  picture: z.string(),
  picture_small: z.string(),
  picture_medium: z.string(),
  picture_big: z.string(),
  picture_xl: z.string(),
  nb_album: z.number(),
  nb_fan: z.number(),
  radio: z.boolean(),
  tracklist: z.string(),
  type: z.string(),
})

export const DeezerArtistSearchResponseSchema = z.object({
  data: z.array(DeezerArtistSchema),
  total: z.number(),
  next: z.string().optional(),
})
