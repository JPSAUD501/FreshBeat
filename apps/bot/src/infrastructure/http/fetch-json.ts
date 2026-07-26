import type { z } from 'zod'

const USER_AGENT = 'FreshBeat/0.1 (https://github.com/JPSAUD501/FreshBeat)'
const DEFAULT_TIMEOUT_MS = 10_000

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    super(`HTTP ${status} ao chamar ${url}`)
    this.name = 'HttpError'
  }
}

export interface FetchJsonOptions {
  timeoutMs?: number
  headers?: Record<string, string>
}

/**
 * fetch com timeout, User-Agent identificado e validação zod.
 * Retorna null em 404 (miss de negócio); lança HttpError nos demais
 * status e ZodError em payload inválido.
 */
export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  options: FetchJsonOptions = {},
): Promise<T | null> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...options.headers },
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  })

  if (response.status === 404) return null
  if (!response.ok) throw new HttpError(response.status, url)

  const body: unknown = await response.json()
  return schema.parse(body)
}
