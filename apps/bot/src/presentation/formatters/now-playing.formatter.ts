import type { NowPlayingInfo } from '../../domain/entities/now-playing.js'
import { escapeHtml } from './lyrics.formatter.js'

/** Caractere invisível usado como texto de link para forçar o preview da capa. */
const INVISIBLE_LINK_TEXT = '️'

/** Textos já traduzidos/interpolados que o formatter precisa. */
export interface NowPlayingLabels {
  listeningNow: string
  listeningWas: string
  explicitBadge: string
  scrobblesTitle: string
  scrobblesTrack: (count: string) => string
  scrobblesAlbum: (count: string) => string
  scrobblesArtist: (count: string) => string
  listeningTime: (duration: string) => string
  popularity: (stars: string) => string
  hoursMinutes: (hours: number, minutes: number) => string
  minutesOnly: (minutes: number) => string
}

/** Monta a mensagem HTML do /playingnow. */
export function formatNowPlaying(info: NowPlayingInfo, labels: NowPlayingLabels): string {
  const lines: string[] = []

  // Link invisível para a capa → Telegram renderiza o preview da imagem
  const imageLink =
    info.imageUrl !== null ? `<a href="${info.imageUrl}">${INVISIBLE_LINK_TEXT}</a>` : ''

  lines.push(`${imageLink}${info.nowPlaying ? labels.listeningNow : labels.listeningWas}`)
  lines.push('')

  const badge = info.explicit ? ` ${labels.explicitBadge}` : ''
  lines.push(
    `[🎧] ${linked(info.trackName, info.links.lastfmTrack)} por ${linked(info.artistName, info.links.lastfmArtist)}${badge}`,
  )
  if (info.albumName !== null) {
    lines.push(`[💿] ${linked(info.albumName, info.links.lastfmAlbum)}`)
  }

  const scrobbles = formatScrobbles(info, labels)
  if (scrobbles !== null) {
    lines.push('', labels.scrobblesTitle, scrobbles)
  }

  const extras: string[] = []
  if (info.listeningSeconds !== null) {
    extras.push(labels.listeningTime(formatDuration(info.listeningSeconds, labels)))
  }
  if (info.popularity !== null) {
    extras.push(labels.popularity(popularityStars(info.popularity)))
  }
  if (extras.length > 0) lines.push('', ...extras)

  return lines.join('\n')
}

function formatScrobbles(info: NowPlayingInfo, labels: NowPlayingLabels): string | null {
  const parts: string[] = []
  if (info.scrobbles.track !== null) {
    parts.push(labels.scrobblesTrack(formatNumber(info.scrobbles.track)))
  }
  if (info.scrobbles.album !== null) {
    parts.push(labels.scrobblesAlbum(formatNumber(info.scrobbles.album)))
  }
  if (info.scrobbles.artist !== null) {
    parts.push(labels.scrobblesArtist(formatNumber(info.scrobbles.artist)))
  }
  return parts.length > 0 ? parts.join(' · ') : null
}

/** Nome com link quando a URL existe; texto puro caso contrário. */
function linked(name: string, url: string | null): string {
  const escaped = escapeHtml(name)
  return url !== null ? `<a href="${url}">${escaped}</a>` : `<b>${escaped}</b>`
}

/** ★★★★☆ a partir da popularidade 0–100 (cada estrela = 20 pontos). */
export function popularityStars(popularity: number): string {
  const filled = Math.max(0, Math.min(5, Math.floor(popularity / 20)))
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`
}

/** "3h 12min" ou "45min" a partir de segundos. */
export function formatDuration(
  totalSeconds: number,
  labels: Pick<NowPlayingLabels, 'hoursMinutes' | 'minutesOnly'>,
): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return labels.hoursMinutes(hours, minutes)
  return labels.minutesOnly(Math.max(1, minutes))
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}
