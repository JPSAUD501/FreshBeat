import { z } from 'zod'

const configSchema = z.object({
  BOT_TOKEN: z.string(),
  POLLING_MODE: z.boolean(),
})
const parsedConfig = configSchema.safeParse({
  BOT_TOKEN: Deno.env.get('BOT_TOKEN'),
  POLLING_MODE: (Deno.env.get('POLLING_MODE') ?? 'false') === 'true',
})

if (!parsedConfig.success) {
  for (const issue of parsedConfig.error.issues) {
    console.error(`Invalid environment value for ${issue.path.join()} (${issue.message})`)
  }
  throw new Error('Invalid environment values')
}


export const config: z.infer<typeof configSchema> = parsedConfig.data
