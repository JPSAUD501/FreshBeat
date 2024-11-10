import { z } from 'zod'
import { TrackSchema } from '../dto/track.dto.ts'

export type SearchTrackRequest = z.infer<typeof SearchTrackRequestSchema>
export type SearchTrackResponse = z.infer<typeof SearchTrackResponseSchema>

export const SearchTrackRequestSchema = z.object({
  trackName: z.string(),
  artistName: z.string(),
  limit: z.number(),
})

export const SearchTrackResponseSchema = z.object({
  collection: z.array(TrackSchema),
  total_results: z.number(),
  next_href: z.string(),
  query_urn: z.string(),
})
