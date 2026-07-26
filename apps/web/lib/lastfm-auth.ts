import { createHash } from 'node:crypto'

const LASTFM_AUTH_URL = 'https://www.last.fm/api/auth/'
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

/** URL para onde o usuário é levado para autorizar o FreshBeat no Last.fm. */
export function buildLastfmAuthUrl(apiKey: string, callbackUrl: string): string {
  const url = new URL(LASTFM_AUTH_URL)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('cb', callbackUrl)
  return url.toString()
}

interface LastfmSessionResponse {
  session?: { name?: string }
}

/**
 * Troca o token do callback OAuth pelo nome de usuário do Last.fm
 * (auth.getSession, assinatura md5 dos parâmetros ordenados + secret).
 * Retorna null em qualquer falha — o chamador mostra erro amigável.
 */
export async function fetchLastfmSessionUsername(options: {
  apiKey: string
  apiSecret: string
  token: string
}): Promise<string | null> {
  const params = new URLSearchParams({
    api_key: options.apiKey,
    method: 'auth.getSession',
    token: options.token,
  })
  const signatureBase = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('')
  params.set(
    'api_sig',
    createHash('md5')
      .update(signatureBase + options.apiSecret)
      .digest('hex'),
  )
  params.set('format', 'json')

  try {
    const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as LastfmSessionResponse
    return data.session?.name ?? null
  } catch {
    return null
  }
}
