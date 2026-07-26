import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import { LastfmUserNotFoundError } from '../../domain/errors/app-error.js'
import type {
  LastFmApi,
  LastFmTopAlbum,
  LastFmTopArtist,
  LastFmTopTrack,
} from '../../domain/ports/lastfm-api.js'
import { computePlaytime } from '../playtime.js'
import type { GetUserTopTracksUseCase } from './get-user-top-tracks.js'

const BRIEF_CACHE_TTL_SECONDS = 5 * 60
const TOP_LISTS_LIMIT = 5

export interface BriefResult {
  readonly username: string
  readonly userUrl: string | null
  readonly imageUrl: string | null
  readonly metrics: {
    readonly playcount: number
    readonly trackCount: number
    readonly artistCount: number
    readonly albumCount: number
  }
  readonly topTracks: LastFmTopTrack[]
  readonly topAlbums: LastFmTopAlbum[]
  readonly topArtists: LastFmTopArtist[]
  readonly playtimeSeconds: number | null
  readonly playtimeApproximate: boolean
  readonly averageDurationSeconds: number | null
}

/**
 * Resumo do perfil: métricas do usuário + top 5 faixas/álbuns/artistas +
 * tempo total de audição (calculado sobre o ranking completo, que vem
 * cacheado do GetUserTopTracksUseCase — custo pesado pago uma vez só).
 */
export class GetBriefUseCase {
  constructor(
    private readonly lastfm: LastFmApi,
    private readonly getUserTopTracks: GetUserTopTracksUseCase,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { username: string }): Promise<BriefResult> {
    const { username } = input
    const key = cacheKey('brief', username)

    return getOrSet(this.cache, key, BRIEF_CACHE_TTL_SECONDS, async () => {
      const [userInfo, topTracksPage, topAlbums, topArtists, allTopTracks] = await Promise.all([
        this.lastfm.getUserInfo({ username }),
        this.lastfm.getTopTracksPage({ username, page: 1, limit: TOP_LISTS_LIMIT }),
        this.lastfm.getTopAlbums({ username, limit: TOP_LISTS_LIMIT }),
        this.lastfm.getTopArtists({ username, limit: TOP_LISTS_LIMIT }),
        this.getUserTopTracks.execute({ username }),
      ])
      if (userInfo === null) throw new LastfmUserNotFoundError(username)

      const playtime = computePlaytime(allTopTracks)
      return {
        username,
        userUrl: userInfo.url,
        imageUrl: userInfo.imageUrl,
        metrics: {
          playcount: userInfo.playcount,
          trackCount: userInfo.trackCount,
          artistCount: userInfo.artistCount,
          albumCount: userInfo.albumCount,
        },
        topTracks: topTracksPage?.tracks ?? [],
        topAlbums,
        topArtists,
        playtimeSeconds: allTopTracks.length > 0 ? playtime.totalSeconds : null,
        playtimeApproximate: playtime.estimatedShare > 0,
        averageDurationSeconds: playtime.averageDurationSeconds,
      }
    })
  }
}
