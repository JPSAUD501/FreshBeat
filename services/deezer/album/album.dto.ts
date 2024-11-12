import { z } from 'zod'

export type DeezerAlbumSearchRequest = z.infer<typeof DeezerAlbumSearchRequestSchema>
export type DeezerAlbum = z.infer<typeof DeezerAlbumSchema>
export type DeezerAlbumSearchResponse = z.infer<typeof DeezerAlbumSearchResponseSchema>

export const DeezerAlbumSearchRequestSchema = z.object({
  album: z.string(),
  limit: z.number(),
})

export const DeezerAlbumSchema = z.object({
  id: z.number(),
  title: z.string(),
  link: z.string(),
  cover: z.string(),
  cover_small: z.string(),
  cover_medium: z.string(),
  cover_big: z.string(),
  cover_xl: z.string(),
  md5_image: z.string(),
  genre_id: z.number(),
  nb_tracks: z.number(),
  record_type: z.string(),
  tracklist: z.string(),
  explicit_lyrics: z.boolean(),
  artist: z.object({
    id: z.number(),
    name: z.string(),
    link: z.string(),
    picture: z.string(),
    picture_small: z.string(),
    picture_medium: z.string(),
    picture_big: z.string(),
    picture_xl: z.string(),
    tracklist: z.string(),
    type: z.string(),
  }),
  type: z.string(),
})

export const DeezerAlbumSearchResponseSchema = z.object({
  data: z.array(DeezerAlbumSchema),
  total: z.number(),
  next: z.string().optional(),
})
