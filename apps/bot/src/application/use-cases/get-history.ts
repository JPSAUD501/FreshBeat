import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { LastFmApi, LastFmRecentTrack } from '../../domain/ports/lastfm-api.js'

/** Entrada do histórico com repetições consecutivas colapsadas. */
export interface HistoryEntry {
  readonly name: string
  readonly artist: string
  readonly url: string | null
  readonly playCount: number
}

export interface HistoryResult {
  readonly username: string
  /** Faixa tocando agora (exibida em destaque, fora da lista). */
  readonly nowPlaying: { name: string; artist: string } | null
  readonly entries: HistoryEntry[]
}

/** Página única de 200 recentes é suficiente para 20 entradas colapsadas. */
const RECENT_LIMIT = 200
/** Cache curto — histórico muda a cada scrobble. */
const HISTORY_CACHE_TTL_SECONDS = 60

/**
 * Histórico de reprodução com colapso de repetições CONSECUTIVAS
 * (mesma URL de faixa → incrementa o contador da última entrada).
 * A faixa "tocando agora" sai da lista e vira destaque.
 */
export class GetHistoryUseCase {
  constructor(
    private readonly lastfm: LastFmApi,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { username: string; maxEntries?: number }): Promise<HistoryResult> {
    const maxEntries = input.maxEntries ?? 20
    const key = cacheKey('history', input.username, String(maxEntries))

    return getOrSet(this.cache, key, HISTORY_CACHE_TTL_SECONDS, async () => {
      const recent = await this.lastfm.getRecentTracksPage({
        username: input.username,
        limit: RECENT_LIMIT,
        page: 1,
      })
      return collapse(recent, input.username, maxEntries)
    })
  }
}

/** Colapsa repetições consecutivas e separa a faixa atual. Exportada para testes. */
export function collapse(
  recent: LastFmRecentTrack[],
  username: string,
  maxEntries: number,
): HistoryResult {
  let nowPlaying: HistoryResult['nowPlaying'] = null
  const entries: HistoryEntry[] = []

  for (const track of recent) {
    if (track.nowPlaying) {
      nowPlaying = { name: track.name, artist: track.artist }
      continue
    }

    const last = entries.at(-1)
    if (last !== undefined && isSameTrack(last, track)) {
      entries[entries.length - 1] = { ...last, playCount: last.playCount + 1 }
      continue
    }
    if (entries.length >= maxEntries) break

    entries.push({
      name: track.name,
      artist: track.artist,
      url: track.url,
      playCount: 1,
    })
  }

  return { username, nowPlaying, entries }
}

/** Mesma faixa = mesma URL; sem URL, compara nome+artista. */
function isSameTrack(entry: HistoryEntry, track: LastFmRecentTrack): boolean {
  if (entry.url !== null && track.url !== null) return entry.url === track.url
  return entry.name === track.name && entry.artist === track.artist
}
