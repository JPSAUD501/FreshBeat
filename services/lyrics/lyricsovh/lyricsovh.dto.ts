import { z } from 'zod'

export const OvhGetLyricsRequestSchema = z.object({
  lyricArtist: z.string(),
  lyricTitle: z.string()
})
export type OvhGetLyricsRequest = z.infer<typeof OvhGetLyricsRequestSchema>

export const OvhGetLyricsResponseSchema = z.object({
  lyrics: z.string()
})
export type OvhGetLyricsResponse = z.infer<typeof OvhGetLyricsResponseSchema>

export const OvhSearchSuggestionsRequestSchema = z.object({
  artist: z.string(),
  title: z.string()
})
export type OvhSearchSuggestionsRequest = z.infer<typeof OvhSearchSuggestionsRequestSchema>

export const OvhSearchSuggestionsResponseSchema = z.object({
  data: z.array(
    z.object({
      title: z.string(),
      artist: z.object({
        name: z.string()
      })
    })
  )
})
export type OvhSearchSuggestionsResponse = z.infer<typeof OvhSearchSuggestionsResponseSchema>
