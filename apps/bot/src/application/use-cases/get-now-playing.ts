import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Logger } from '@freshbeat/logging'
import type { NowPlayingInfo } from '../../domain/entities/now-playing.js'
import type { PlayingTrack } from '../../domain/entities/track.js'
import { NotListeningError } from '../../domain/errors/app-error.js'
import type { LastFmApi } from '../../domain/ports/lastfm-api.js'
import type { MusicSearchProvider, MusicSearchResult } from '../../domain/ports/music-search.js'
import type { RecentTracksProvider } from '../../domain/ports/recent-tracks.js'

/** Enriquecimento cacheado por 5 minutos (scrobbles mudam devagar). */
const ENRICHMENT_CACHE_TTL_SECONDS = 5 * 60

interface Enrichment {
  trackUrl: string | null
  artistUrl: string | null
  albumUrl: string | null
  imageUrl: string | null
  durationSeconds: number | null
  trackPlaycount: number | null
  albumPlaycount: number | null
  artistPlaycount: number | null
  spotify: MusicSearchResult | null
  deezer: MusicSearchResult | null
}

export interface GetNowPlayingDeps {
  recentTracks: RecentTracksProvider
  lastfm: LastFmApi
  /** Buscas externas (Spotify, Deezer) — falhas degradam para null. */
  musicSearch: MusicSearchProvider[]
  cache: CacheStore
  logger: Logger
}

/**
 * Monta a visão enriquecida do "tocando agora": dados do Last.fm
 * (scrobbles, duração, capa) + Spotify/Deezer em paralelo.
 * Só o Last.fm é essencial — buscas externas falham em silêncio (log).
 */
export class GetNowPlayingUseCase {
  constructor(private readonly deps: GetNowPlayingDeps) {}

  async execute(input: { lastfmUsername: string }): Promise<NowPlayingInfo> {
    const { lastfmUsername } = input

    const recent = await this.deps.recentTracks.getMostRecentTrack(lastfmUsername)
    if (recent === null) throw new NotListeningError()

    const key = cacheKey('nowplaying', lastfmUsername, recent.artist, recent.name)
    const enrichment = await getOrSet(this.deps.cache, key, ENRICHMENT_CACHE_TTL_SECONDS, () =>
      this.loadEnrichment(lastfmUsername, recent),
    )

    return assemble(lastfmUsername, recent, enrichment)
  }

  private async loadEnrichment(username: string, track: PlayingTrack): Promise<Enrichment> {
    const { lastfm, musicSearch, logger } = this.deps

    const searches = musicSearch.map(async (provider) => ({
      id: provider.id,
      result: await provider
        .searchTrack({ track: track.name, artist: track.artist })
        .catch((error: unknown) => {
          logger.warn({ err: error, provider: provider.id }, 'busca externa falhou (degradado)')
          return null
        }),
    }))

    const [trackInfo, artistInfo, albumInfo, ...searchResults] = await Promise.all([
      lastfm.getTrackInfo({ track: track.name, artist: track.artist, username }),
      lastfm.getArtistInfo({ artist: track.artist, username }),
      track.album !== undefined
        ? lastfm.getAlbumInfo({ album: track.album, artist: track.artist, username })
        : Promise.resolve(null),
      ...searches,
    ])

    const searchById = new Map(searchResults.map((entry) => [entry.id, entry.result]))
    const spotify = searchById.get('spotify') ?? null
    const deezer = searchById.get('deezer') ?? null

    return {
      trackUrl: trackInfo?.url ?? null,
      artistUrl: artistInfo?.url ?? null,
      albumUrl: albumInfo?.url ?? null,
      imageUrl: albumInfo?.imageUrl ?? artistInfo?.imageUrl ?? null,
      durationSeconds:
        trackInfo?.durationSeconds ??
        spotify?.durationSeconds ??
        deezer?.durationSeconds ??
        track.durationSeconds ??
        null,
      trackPlaycount: trackInfo?.userPlaycount ?? null,
      albumPlaycount: albumInfo?.userPlaycount ?? null,
      artistPlaycount: artistInfo?.userPlaycount ?? null,
      spotify,
      deezer,
    }
  }
}

function assemble(username: string, track: PlayingTrack, enrichment: Enrichment): NowPlayingInfo {
  const { trackPlaycount, durationSeconds } = enrichment
  return {
    lastfmUsername: username,
    nowPlaying: track.nowPlaying,
    trackName: track.name,
    artistName: track.artist,
    albumName: track.album ?? null,
    imageUrl: enrichment.imageUrl,
    durationSeconds,
    scrobbles: {
      track: trackPlaycount,
      album: enrichment.albumPlaycount,
      artist: enrichment.artistPlaycount,
    },
    explicit: (enrichment.spotify?.explicit ?? false) || (enrichment.deezer?.explicit ?? false),
    popularity: enrichment.spotify?.popularity ?? null,
    listeningSeconds:
      trackPlaycount !== null && trackPlaycount > 0 && durationSeconds !== null
        ? trackPlaycount * durationSeconds
        : null,
    links: {
      lastfmTrack: enrichment.trackUrl,
      lastfmArtist: enrichment.artistUrl,
      lastfmAlbum: enrichment.albumUrl,
      spotify: enrichment.spotify?.url ?? null,
      deezer: enrichment.deezer?.url ?? null,
    },
  }
}
