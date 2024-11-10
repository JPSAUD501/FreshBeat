import { z } from 'zod'

export type SoundcloudPreviewFromResponse = z.infer<typeof SoundcloudPreviewFromResponseSchema>

export const SoundcloudPreviewFromResponseSchema = z.object({
  partialPreviewUrl: z.string()
})
