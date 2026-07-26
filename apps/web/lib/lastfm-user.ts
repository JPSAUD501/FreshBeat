const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

export interface LastfmUserStats {
  scrobbles: number
  artists: number
  albums: number
  tracks: number
}

interface LastfmUserInfoResponse {
  user?: {
    playcount?: string
    artist_count?: string
    album_count?: string
    track_count?: string
  }
}

/**
 * Stats básicos do perfil Last.fm para o dashboard (user.getInfo —
 * método de leitura, não precisa de assinatura). Revalida a cada 5 min.
 * Retorna null em qualquer falha — o dashboard degrada sem os números.
 */
export async function fetchLastfmUserStats(
  apiKey: string,
  username: string,
): Promise<LastfmUserStats | null> {
  const params = new URLSearchParams({
    method: 'user.getInfo',
    user: username,
    api_key: apiKey,
    format: 'json',
  })
  try {
    const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 300 },
    })
    if (!response.ok) return null
    const data = (await response.json()) as LastfmUserInfoResponse
    if (data.user === undefined) return null
    return {
      scrobbles: Number(data.user.playcount ?? 0),
      artists: Number(data.user.artist_count ?? 0),
      albums: Number(data.user.album_count ?? 0),
      tracks: Number(data.user.track_count ?? 0),
    }
  } catch {
    return null
  }
}
