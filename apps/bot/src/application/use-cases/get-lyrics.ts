import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Logger } from '@freshbeat/logging'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import { LyricsNotFoundError } from '../../domain/errors/app-error.js'
import type { LyricsProvider } from '../../domain/ports/lyrics-provider.js'

/** Cache de letras por 7 dias — letra não muda. */
const LYRICS_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60

export interface LyricsProviders {
  /** Disparados em paralelo; o melhor resultado vence. */
  primary: LyricsProvider[]
  /** Só consultado se TODOS os primários falharem. */
  fallback: LyricsProvider
}

/**
 * Busca de letra com a estratégia:
 *
 *   ┌─ lrcmux ─┐
 *   │          ├─ escolhe o melhor resultado (prefere sincronizada)
 *   └─ LRCLIB ─┘
 *          ↓ somente se ambos falharem
 *     lyrics.ovh
 *
 * Erros de provedor (rede, 5xx, resposta inválida) são logados e
 * tratados como miss — um provedor fora do ar não derruba a busca.
 */
export class GetLyricsUseCase {
  constructor(
    private readonly providers: LyricsProviders,
    private readonly cache: CacheStore,
    private readonly logger: Logger,
  ) {}

  async execute(track: TrackRef): Promise<Lyrics> {
    const key = cacheKey('lyrics', track.artist, track.name)
    return getOrSet(this.cache, key, LYRICS_CACHE_TTL_SECONDS, () => this.fetchLyrics(track))
  }

  private async fetchLyrics(track: TrackRef): Promise<Lyrics> {
    const results = await Promise.all(
      this.providers.primary.map((provider) => this.tryProvider(provider, track)),
    )
    const best = pickBest(results.filter((lyrics) => lyrics !== null))
    if (best !== undefined) return best

    const fallbackResult = await this.tryProvider(this.providers.fallback, track)
    if (fallbackResult !== null) return fallbackResult

    throw new LyricsNotFoundError(track.name, track.artist)
  }

  private async tryProvider(provider: LyricsProvider, track: TrackRef): Promise<Lyrics | null> {
    try {
      return await provider.search(track)
    } catch (error) {
      this.logger.warn(
        { err: error, provider: provider.source.id, track: track.name, artist: track.artist },
        'lyrics provider failed',
      )
      return null
    }
  }
}

/**
 * Escolhe o melhor entre os resultados dos primários:
 * letra sincronizada (LRC) vale mais que texto puro; em empate,
 * vence quem veio primeiro na lista (ordem de preferência).
 */
export function pickBest(candidates: Lyrics[]): Lyrics | undefined {
  return [...candidates].sort((a, b) => score(b) - score(a))[0]
}

function score(lyrics: Lyrics): number {
  let value = 0
  if (lyrics.syncedLyrics !== null) value += 2
  if (lyrics.plainLyrics.length > 0) value += 1
  return value
}
