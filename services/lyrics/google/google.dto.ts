import { z } from 'zod'

export const GoogleLyricsSchema = z.object({
  songwriters: z.string().optional(),
  title: z.string().optional(),
  artist: z.string().optional(),
  genres: z.string().optional(),
  sources: z.array(z.string()),
  lyrics: z.string(),
})

export type GoogleLyrics = z.infer<typeof GoogleLyricsSchema>
