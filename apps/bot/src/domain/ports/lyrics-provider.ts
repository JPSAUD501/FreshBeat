import type { Lyrics } from '../entities/lyrics.js'
import type { TrackRef } from '../entities/track.js'

/**
 * Port de provedor de letras. Retorna null quando não encontra
 * (miss normal do negócio) e lança em erros inesperados (rede,
 * resposta inválida) — o aggregator decide como tratar.
 */
export interface LyricsProvider {
  readonly source: { readonly id: string; readonly name: string }
  search(track: TrackRef): Promise<Lyrics | null>
}
