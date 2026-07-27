import { computePlaytime } from '@freshbeat/lastfm'
import { NextResponse, type NextRequest } from 'next/server'
import { getAuthenticatedUser } from '../../../../../lib/api-session'
import type { TopsDto } from '../../../../../lib/dashboard-types'
import {
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  LASTFM_PERIODS,
  type LastfmPeriod,
} from '../../../../../lib/lastfm'
import { getCacheStore, getConfig } from '../../../../../lib/server'

/**
 * Top faixas/artistas/álbuns + tempo de audição do período,
 * para as abas de stats do dashboard.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await getAuthenticatedUser(request)
  if (auth === null) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.lastfmUsername === null)
    return NextResponse.json({ error: 'not_linked' }, { status: 409 })

  const periodParam = request.nextUrl.searchParams.get('period') ?? '7day'
  const period: LastfmPeriod = (LASTFM_PERIODS as readonly string[]).includes(periodParam)
    ? (periodParam as LastfmPeriod)
    : '7day'

  const options = { apiKey: getConfig().lastfm.LASTFM_API_KEY, cache: getCacheStore() }
  const [tracks, artists, albums] = await Promise.all([
    getTopTracks(options, auth.lastfmUsername, period, 50),
    getTopArtists(options, auth.lastfmUsername, period, 10),
    getTopAlbums(options, auth.lastfmUsername, period, 10),
  ])

  if (tracks === null || artists === null || albums === null) {
    return NextResponse.json({ error: 'lastfm_unavailable' }, { status: 502 })
  }

  const playtime = computePlaytime(
    tracks.map((track) => ({
      name: track.name,
      artist: track.artist,
      url: track.url,
      playcount: track.playcount,
      durationSeconds: track.durationSeconds,
    })),
  )

  const body: TopsDto = {
    tracks: tracks.slice(0, 10),
    artists,
    albums,
    playtime: {
      totalSeconds: playtime.totalSeconds,
      estimated: playtime.estimatedShare > 0.2,
    },
  }
  return NextResponse.json(body)
}
