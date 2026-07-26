import { z } from 'zod'

/**
 * Configuração central do FreshBeat.
 *
 * Regras:
 * - FAIL-FAST: qualquer variável inválida derruba o processo na inicialização
 *   com uma mensagem clara. Nunca seguimos com config inválida.
 * - Grupos de integração são "tudo ou nada": se qualquer variável de um grupo
 *   opcional estiver presente, todas as do grupo passam a ser obrigatórias.
 *   Isso evita features meio-configuradas quebrando em runtime.
 * - Ninguém lê `process.env` diretamente fora daqui.
 */

const requiredString = z.string().min(1)

const telegramSchema = z.object({
  BOT_TOKEN: requiredString,
  BOT_USERNAME: requiredString,
})

const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
})

const redisSchema = z.object({
  REDIS_URL: z.string().min(1),
})

const lastfmSchema = z.object({
  LASTFM_API_KEY: requiredString,
  LASTFM_API_SECRET: requiredString,
})

const spotifySchema = z.object({
  SPOTIFY_CLIENT_ID: requiredString,
  SPOTIFY_CLIENT_SECRET: requiredString,
})

const geniusSchema = z.object({
  GENIUS_ACCESS_TOKEN: requiredString,
})

const aiSchema = z.object({
  OPENROUTER_API_KEY: requiredString,
  AI_MODEL_EXPLAIN: requiredString,
  AI_MODEL_TRANSLATE: requiredString,
  AI_MODEL_IMAGE_PROMPT: requiredString,
})

const replicateSchema = z.object({
  REPLICATE_API_TOKEN: requiredString,
})

const s3Schema = z.object({
  S3_ENDPOINT: z.string().url(),
  S3_REGION: requiredString,
  S3_BUCKET: requiredString,
  S3_ACCESS_KEY: requiredString,
  S3_SECRET_KEY: requiredString,
  S3_PUBLIC_URL: z.string().url(),
})

const webSchema = z.object({
  WEB_BASE_URL: z.string().url(),
  WEB_SESSION_SECRET: z.string().min(32),
})

const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
})

type Env = Record<string, string | undefined>

export class ConfigError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super(
      `Configuração inválida:\n${issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')}`,
    )
    this.name = 'ConfigError'
  }
}

function parseGroup<S extends z.ZodRawShape>(
  schema: z.ZodObject<S>,
  env: Env,
  groupName: string,
): z.infer<z.ZodObject<S>> {
  const result = schema.safeParse(env)
  if (!result.success) {
    throw new ConfigError(
      result.error.issues.map((issue) => ({
        ...issue,
        path: [groupName, ...issue.path],
      })),
    )
  }
  return result.data
}

/**
 * Grupo opcional "tudo ou nada": nenhuma chave presente → undefined;
 * qualquer chave presente → o schema completo passa a ser obrigatório.
 */
function parseOptionalGroup<S extends z.ZodRawShape>(
  schema: z.ZodObject<S>,
  env: Env,
  groupName: string,
): z.infer<z.ZodObject<S>> | undefined {
  const anyPresent = Object.keys(schema.shape).some(
    (key) => env[key] !== undefined && env[key] !== '',
  )
  if (!anyPresent) return undefined
  return parseGroup(schema, env, groupName)
}

export function loadConfig(env: Env = process.env) {
  return {
    // Núcleo obrigatório — sem isso o app nem sobe
    telegram: parseGroup(telegramSchema, env, 'telegram'),
    database: parseGroup(databaseSchema, env, 'database'),
    redis: parseGroup(redisSchema, env, 'redis'),
    lastfm: parseGroup(lastfmSchema, env, 'lastfm'),
    web: parseGroup(webSchema, env, 'web'),
    logging: parseGroup(loggingSchema, env, 'logging'),
    // Integrações opcionais — features degradam com mensagem clara
    spotify: parseOptionalGroup(spotifySchema, env, 'spotify'),
    genius: parseOptionalGroup(geniusSchema, env, 'genius'),
    ai: parseOptionalGroup(aiSchema, env, 'ai'),
    replicate: parseOptionalGroup(replicateSchema, env, 'replicate'),
    s3: parseOptionalGroup(s3Schema, env, 's3'),
  }
}

export type Config = ReturnType<typeof loadConfig>

/** Garante que um grupo opcional está configurado, ou falha com mensagem clara. */
export function requireGroup<T>(group: T | undefined, name: string): T {
  if (group === undefined) {
    throw new ConfigError([
      {
        code: z.ZodIssueCode.custom,
        path: [name],
        message: `Grupo de configuração "${name}" ausente. Defina as variáveis correspondentes no .env para habilitar esta feature.`,
      },
    ])
  }
  return group
}
