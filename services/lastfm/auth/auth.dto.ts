import { z } from 'zod'

export type LastFmAuthGetSignatureRequest = z.infer<typeof LastFmAuthGetSignatureRequestSchema>
export type LastFmAuthGetSignatureResponse = z.infer<typeof LastFmAuthGetSignatureResponseSchema>
export type LastFmAuthCreateSessionRequest = z.infer<typeof LastFmAuthCreateSessionRequestSchema>
export type LastFmAuthCreateSessionResponse = z.infer<typeof LastFmAuthCreateSessionResponseSchema>

export const LastFmAuthGetSignatureRequestSchema = z.object({
  parameters: z.record(z.string()),
})

export const LastFmAuthGetSignatureResponseSchema = z.object({
  signature: z.string(),
})

export const LastFmAuthCreateSessionRequestSchema = z.object({
  token: z.string(),
})

export const LastFmAuthCreateSessionResponseSchema = z.object({
  session: z.object({
    name: z.string(),
    key: z.string(),
    subscriber: z.number(),
  }),
})
