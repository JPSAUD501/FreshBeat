import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { LastFmApi, LastFmTopTrack } from '../../domain/ports/lastfm-api.js'

/** Lista completa cacheada por 6 horas — muda devagar e custa N requests. */
const TOP_TRACKS_CACHE_TTL_SECONDS = 6 * 60 * 60
const PAGE_LIMIT = 1000
const FETCH_CONCURRENCY = 2
/** Teto de segurança: 10 páginas × 1000 = 10 mil faixas rankeadas. */
const MAX_PAGES = 10

/**
 * Ranking COMPLETO de faixas do usuário (user.getTopTracks paginado).
 * Base pesada compartilhada por /pnalbum, /pnartist e /brief —
 * por isso fica cacheada: o primeiro comando paga o custo, os demais
 * leem do Redis.
 */
export class GetUserTopTracksUseCase {
  constructor(
    private readonly lastfm: LastFmApi,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { username: string }): Promise<LastFmTopTrack[]> {
    const key = cacheKey('user-top-tracks', input.username)
    return getOrSet(this.cache, key, TOP_TRACKS_CACHE_TTL_SECONDS, () =>
      this.fetchAll(input.username),
    )
  }

  private async fetchAll(username: string): Promise<LastFmTopTrack[]> {
    const firstPage = await this.lastfm.getTopTracksPage({
      username,
      page: 1,
      limit: PAGE_LIMIT,
    })
    if (firstPage === null) return []

    const totalPages = Math.min(Math.ceil(firstPage.total / PAGE_LIMIT), MAX_PAGES)
    if (totalPages <= 1) return firstPage.tracks

    const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2)
    const pages = await mapPool(remainingPages, FETCH_CONCURRENCY, (page) =>
      this.lastfm.getTopTracksPage({ username, page, limit: PAGE_LIMIT }),
    )

    return [firstPage, ...pages].flatMap((page) => page?.tracks ?? [])
  }
}

/** Map com concorrência limitada (PromisePool mínimo). */
async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array<R>(items.length)
  let nextIndex = 0

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item !== undefined) results[index] = await fn(item)
    }
  })
  await Promise.all(workers)
  return results
}
