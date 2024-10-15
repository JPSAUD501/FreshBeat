import { z } from 'zod'

export const ZodUser = z.object({
  uuid: z.string(),
  name: z.string(),
  telegram_id: z.string(),
  created_at: z.string().default(() => new Date().toISOString()),
})
export type User = z.infer<typeof ZodUser>
