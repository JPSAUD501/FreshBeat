import type { BriefResult } from '../../application/use-cases/get-brief.js'
import { escapeHtml } from './lyrics.formatter.js'
import { formatDuration, type NowPlayingLabels } from './now-playing.formatter.js'

/** Caractere invisível usado como texto de link para forçar o preview do avatar. */
const INVISIBLE_LINK_TEXT = '️'

/** Textos já traduzidos/interpolados que o formatter precisa. */
export interface BriefLabels {
  title: string
  metricsLine1: string
  metricsLine2: string
  playtime: (duration: string) => string
  avgDuration: (duration: string) => string
  topTracksTitle: string
  topAlbumsTitle: string
  topArtistsTitle: string
  hoursMinutes: (hours: number, minutes: number) => string
  minutesOnly: (minutes: number) => string
  minutesSeconds: (minutes: number, seconds: number) => string
  /** Locale BCP 47 para formatar números. */
  numberLocale: string
}

/** Monta a mensagem HTML do /brief. */
export function formatBrief(brief: BriefResult, labels: BriefLabels): string {
  const lines: string[] = []

  const avatarLink =
    brief.imageUrl !== null ? `<a href="${brief.imageUrl}">${INVISIBLE_LINK_TEXT}</a>` : ''
  lines.push(`${avatarLink}${labels.title}`)
  lines.push('', labels.metricsLine1, labels.metricsLine2)

  const timeParts: string[] = []
  if (brief.playtimeSeconds !== null && brief.playtimeSeconds > 0) {
    const marker = brief.playtimeApproximate ? '≈' : ''
    timeParts.push(labels.playtime(marker + formatDuration(brief.playtimeSeconds, labels)))
  }
  if (brief.averageDurationSeconds !== null) {
    const minutes = Math.floor(brief.averageDurationSeconds / 60)
    const seconds = brief.averageDurationSeconds % 60
    timeParts.push(labels.avgDuration(labels.minutesSeconds(minutes, seconds)))
  }
  if (timeParts.length > 0) lines.push('', ...timeParts)

  appendRanking(lines, labels.topTracksTitle, brief.topTracks, labels.numberLocale)
  appendRanking(lines, labels.topAlbumsTitle, brief.topAlbums, labels.numberLocale)
  appendRanking(lines, labels.topArtistsTitle, brief.topArtists, labels.numberLocale)

  return lines.join('\n')
}

interface RankedItem {
  name: string
  url: string | null
  playcount: number
  artist?: string
}

function appendRanking(
  lines: string[],
  title: string,
  items: RankedItem[],
  numberLocale: string,
): void {
  if (items.length === 0) return
  lines.push('', title)
  for (const item of items) {
    const suffix = item.artist !== undefined ? ` — ${escapeHtml(item.artist)}` : ''
    const name = escapeHtml(item.name)
    const linked = item.url !== null ? `<a href="${item.url}">${name}</a>` : `<b>${name}</b>`
    lines.push(`(${item.playcount.toLocaleString(numberLocale)}x) ${linked}${suffix}`)
  }
}

/** Reuso das durações sem arrastar o tipo inteiro para o comando. */
export type BriefDurationLabels = Pick<NowPlayingLabels, 'hoursMinutes' | 'minutesOnly'>
