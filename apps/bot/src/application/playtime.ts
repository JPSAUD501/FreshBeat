/**
 * O cálculo de tempo de audição virou pacote compartilhado (@freshbeat/lastfm)
 * para o site exibir o mesmo número do bot. Re-export para não quebrar imports.
 */
export { computePlaytime } from '@freshbeat/lastfm'
export type { PlaytimeResult, RankedTrack } from '@freshbeat/lastfm'
