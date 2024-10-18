import { z } from 'zod'
import 'dotenv'

const configSchema = z.object({
  BOT_TOKEN: z.string(),
  POLLING_MODE: z.boolean(),
  CROWDIN_TOKEN: z.string(),
  CROWDIN_PROJECT_ID: z.number(),
  CROWDIN_FILE_ID: z.number(),
  LASTFM_API_KEY: z.string(),
  LASTFM_API_SECRET: z.string(),
  DENO_KV_URL: z.string().optional(),
})
const configData = {
  BOT_TOKEN: Deno.env.get('BOT_TOKEN'),
  POLLING_MODE: (Deno.env.get('POLLING_MODE') ?? 'false') === 'true',
  CROWDIN_TOKEN: Deno.env.get('CROWDIN_TOKEN'),
  CROWDIN_PROJECT_ID: 727545,
  CROWDIN_FILE_ID: 18,
  LASTFM_API_KEY: Deno.env.get('LASTFM_API_KEY'),
  LASTFM_API_SECRET: Deno.env.get('LASTFM_API_SECRET'),
  DENO_KV_URL: Deno.env.get('DENO_KV_URL'),
}
const parsedConfig = configSchema.safeParse(configData)

if (!parsedConfig.success) {
  for (const issue of parsedConfig.error.issues) {
    console.error(`Invalid environment value for ${issue.path.join()} (${issue.message})`)
  }
}

export const config = configData as z.infer<typeof configSchema>
