import { z } from 'zod'
import 'dotenv/config'

const configSchema = z.object({
  PRODUCTION_DOMAIN: z.string(),
  BOT_TOKEN: z.string(),
  POLLING_MODE: z.boolean(),
  CROWDIN_TOKEN: z.string().optional(),
  CROWDIN_PROJECT_ID: z.number(),
  CROWDIN_FILE_ID: z.number(),
  LASTFM_API_KEY: z.string(),
  LASTFM_API_SECRET: z.string(),
  DATABASE_URL: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  GENIUS_ACCESS_TOKEN: z.string(),
  ACRCLOUD_API_KEY: z.string(),
  ACRCLOUD_API_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  SUPABASE_CLIENT_URL: z.string(),
  SUPABASE_CLIENT_SECRET: z.string(),
})
const configData = {
  PRODUCTION_DOMAIN: 'freshbeat.deno.dev',
  BOT_TOKEN: Deno.env.get('BOT_TOKEN'),
  POLLING_MODE: (Deno.env.get('POLLING_MODE') ?? 'false') === 'true',
  CROWDIN_TOKEN: Deno.env.get('CROWDIN_TOKEN'),
  CROWDIN_PROJECT_ID: 727545,
  CROWDIN_FILE_ID: 18,
  LASTFM_API_KEY: Deno.env.get('LASTFM_API_KEY'),
  LASTFM_API_SECRET: Deno.env.get('LASTFM_API_SECRET'),
  DATABASE_URL: Deno.env.get('DATABASE_URL'),
  SPOTIFY_CLIENT_ID: Deno.env.get('SPOTIFY_CLIENT_ID'),
  SPOTIFY_CLIENT_SECRET: Deno.env.get('SPOTIFY_CLIENT_SECRET'),
  GENIUS_ACCESS_TOKEN: Deno.env.get('GENIUS_ACCESS_TOKEN'),
  ACRCLOUD_API_KEY: Deno.env.get('ACRCLOUD_API_KEY'),
  ACRCLOUD_API_SECRET: Deno.env.get('ACRCLOUD_API_SECRET'),
  OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
  ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY'),
  REPLICATE_API_TOKEN: Deno.env.get('REPLICATE_API_TOKEN'),
  SUPABASE_CLIENT_URL: Deno.env.get('SUPABASE_CLIENT_URL'),
  SUPABASE_CLIENT_SECRET: Deno.env.get('SUPABASE_CLIENT_SECRET'),
}
const parsedConfig = configSchema.safeParse(configData)

if (!parsedConfig.success) {
  for (const issue of parsedConfig.error.issues) {
    console.error(`Invalid environment value for ${issue.path.join()} (${issue.message})`)
  }
}

export const config = configData as z.infer<typeof configSchema>
