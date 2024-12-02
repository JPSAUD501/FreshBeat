import { z } from 'zod'

export type LyricsSearchRequest = z.infer<typeof LyricsSearchRequestSchema>
export type LyricsProvider = z.infer<typeof LyricsProviderSchema>
export type LyricsData = z.infer<typeof LyricsDataSchema>

export const LyricsSearchRequestSchema = z.object({
  track: z.string(),
  artist: z.string(),
})

export const LyricsProviderSchema = z.object({
  name: z.string(),
  url: z.string(),
})

export const LyricsDataSchema = z.object({
  lyrics: z.string(),
  composers: z.string().optional(),
  url: z.string(),
  provider: LyricsProviderSchema,
})
