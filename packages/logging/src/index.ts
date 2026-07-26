import { pino, type Logger, type LoggerOptions } from 'pino'

export type { Logger }

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

/**
 * Campos que nunca devem aparecer em logs. O pino substitui por "[Redacted]".
 * Mantenha esta lista alinhada com as chaves do `.env.example`.
 */
const REDACT_PATHS = [
  'BOT_TOKEN',
  'token',
  'password',
  'secret',
  'apiKey',
  'api_key',
  'accessKey',
  'access_key',
  'authorization',
  'headers.authorization',
  '*.BOT_TOKEN',
  '*.token',
  '*.password',
  '*.secret',
  '*.apiKey',
  '*.accessKey',
  '*.accessToken',
]

export interface CreateLoggerOptions {
  level?: LogLevel
  /** Nome do app/package, ex.: "bot", "web". */
  name: string
  /** Pretty print para desenvolvimento local. */
  pretty?: boolean
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const pinoOptions: LoggerOptions = {
    name: options.name,
    level: options.level ?? 'info',
    redact: { paths: REDACT_PATHS, censor: '[Redacted]' },
    base: { app: options.name },
    timestamp: pino.stdTimeFunctions.isoTime,
  }

  if (options.pretty) {
    return pino({
      ...pinoOptions,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
    })
  }

  return pino(pinoOptions)
}

/** Logger silencioso para testes. */
export function createSilentLogger(): Logger {
  return pino({ enabled: false })
}
