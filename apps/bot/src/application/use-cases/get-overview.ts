import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Logger } from '@freshbeat/logging'
import type { EntityOverview } from '../../domain/entities/overview.js'
import { AlbumNotIdentifiedError, NotListeningError } from '../../domain/errors/app-error.js'
import type { LastFmApi, LastFmTopTrack } from '../../domain/ports/lastfm-api.js'
import type { MusicSearchProvider } from '../../domain/ports/music-search.js'
import type { RecentTracksProvider } from '../../domain/ports/recent-tracks.js'
import { computePlaytime } from '../playtime.js'
import type { GetUserTopTracksUseCase } from './get-user-top-tracks.js'

const OVERVIEW_CACHE_TTL_SECONDS = 5 * 60

export interface GetAlbumOverviewDeps {
  recentTracks: RecentTracksProvider
  lastfm: LastFmApi
  musicSearch: MusicSearchProvider[]
  getUserTopTracks: GetUserTopTracksUseCase
  cache: CacheStore
  logger: Logger
}

/** Visão do ÁLBUM da faixa atual: scrobbles, links, suas mais ouvidas e tempo total. */
export class GetAlbumOverviewUseCase {
  constructor(private readonly deps: GetAlbumOverviewDeps) {}

  async execute(input: { username: string }): Promise<EntityOverview> {
    const { username } = input

    const recent = await this.deps.recentTracks.getMostRecentTrack(username)
    if (recent === null) throw new NotListeningError()
    if (recent.album === undefined) throw new AlbumNotIdentifiedError()

    const key = cacheKey('album-overview', username, recent.artist, recent.album)
    return getOrSet(this.deps.cache, key, OVERVIEW_CACHE_TTL_SECONDS, async () => {
      const [albumInfo, links, topTracks] = await Promise.all([
        this.deps.lastfm.getAlbumInfo({
          album: recent.album ?? '',
          artist: recent.artist,
          username,
        }),
        searchLinks(
          this.deps.musicSearch,
          'album',
          { album: recent.album ?? '', artist: recent.artist },
          this.deps.logger,
        ),
        this.deps.getUserTopTracks.execute({ username }),
      ])

      const albumTrackNames = new Set(
        (albumInfo?.trackNames ?? []).map((name) => name.toLowerCase()),
      )
      const filtered = topTracks
        .filter((track) => albumTrackNames.has(track.name.toLowerCase()))
        .sort((a, b) => b.playcount - a.playcount)

      return assemble(
        username,
        recent.nowPlaying,
        recent.album ?? '',
        recent.artist,
        albumInfo,
        links,
        filtered,
      )
    })
  }
}

/** Visão do ARTISTA da faixa atual. */
export class GetArtistOverviewUseCase {
  constructor(private readonly deps: GetAlbumOverviewDeps) {}

  async execute(input: { username: string }): Promise<EntityOverview> {
    const { username } = input

    const recent = await this.deps.recentTracks.getMostRecentTrack(username)
    if (recent === null) throw new NotListeningError()

    const key = cacheKey('artist-overview', username, recent.artist)
    return getOrSet(this.deps.cache, key, OVERVIEW_CACHE_TTL_SECONDS, async () => {
      const [artistInfo, links, topTracks] = await Promise.all([
        this.deps.lastfm.getArtistInfo({ artist: recent.artist, username }),
        searchLinks(this.deps.musicSearch, 'artist', { artist: recent.artist }, this.deps.logger),
        this.deps.getUserTopTracks.execute({ username }),
      ])

      const artistName = recent.artist.toLowerCase()
      const filtered = topTracks
        .filter((track) => track.artist.toLowerCase() === artistName)
        .sort((a, b) => b.playcount - a.playcount)

      return assemble(
        username,
        recent.nowPlaying,
        recent.artist,
        recent.artist,
        artistInfo,
        links,
        filtered,
      )
    })
  }
}

interface InfoLike {
  url: string | null
  userPlaycount: number | null
  imageUrl: string | null
}

function assemble(
  username: string,
  nowPlaying: boolean,
  name: string,
  artistName: string,
  info: InfoLike | null,
  links: { spotify: string | null; deezer: string | null },
  filtered: LastFmTopTrack[],
): EntityOverview {
  const playtime = computePlaytime(filtered)
  return {
    username,
    nowPlaying,
    name,
    artistName,
    imageUrl: info?.imageUrl ?? null,
    lastfmUrl: info?.url ?? null,
    scrobbles: info?.userPlaycount ?? null,
    spotifyUrl: links.spotify,
    deezerUrl: links.deezer,
    topTracks: filtered,
    playtimeSeconds: filtered.length > 0 ? playtime.totalSeconds : null,
    playtimeApproximate: playtime.estimatedShare > 0,
  }
}

async function searchLinks(
  providers: MusicSearchProvider[],
  kind: 'album' | 'artist',
  input: { album?: string; artist: string },
  logger: Logger,
): Promise<{ spotify: string | null; deezer: string | null }> {
  const results = await Promise.all(
    providers.map(async (provider) => ({
      id: provider.id,
      url: await (
        kind === 'album'
          ? provider.searchAlbum({ album: input.album ?? '', artist: input.artist })
          : provider.searchArtist({ artist: input.artist })
      ).catch((error: unknown) => {
        logger.warn({ err: error, provider: provider.id }, 'busca externa falhou (degradado)')
        return null
      }),
    })),
  )
  const byId = new Map(results.map((entry) => [entry.id, entry.url]))
  return { spotify: byId.get('spotify') ?? null, deezer: byId.get('deezer') ?? null }
}
