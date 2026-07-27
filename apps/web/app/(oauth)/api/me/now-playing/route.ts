import { NextResponse, type NextRequest } from 'next/server'
import { getAuthenticatedUser } from '../../../../../lib/api-session'
import { toRecentTrackDto } from '../../../../../lib/dashboard-types'
import { getRecentTracks } from '../../../../../lib/lastfm'
import { getConfig } from '../../../../../lib/server'

/**
 * Faixa tocando agora do usuário logado (auto-refresh do dashboard).
 * Sem cache — o polling de 20s precisa de dado fresco.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await getAuthenticatedUser(request)
  if (auth === null) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.lastfmUsername === null) return NextResponse.json({ track: null })

  const tracks = await getRecentTracks(
    { apiKey: getConfig().lastfm.LASTFM_API_KEY },
    auth.lastfmUsername,
    1,
  )
  const current = tracks?.[0]
  return NextResponse.json({
    track: current !== undefined && current.nowPlaying ? toRecentTrackDto(current) : null,
  })
}
