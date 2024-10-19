import { z } from 'zod'

export const zodStartCommandProps = z.object({
  from_chat_id: z.number().optional(),
  token: z.string().optional(),
})

export type StartCommandProps = z.infer<typeof zodStartCommandProps>
