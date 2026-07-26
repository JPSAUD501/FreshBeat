import type { EntityOverview } from '../../domain/entities/overview.js'
import { escapeHtml } from './lyrics.formatter.js'
import { formatDuration, type NowPlayingLabels } from './now-playing.formatter.js'

/** Caractere invisível usado como texto de link para forçar o preview da capa. */
const INVISIBLE_LINK_TEXT = '️'
/** Máximo de faixas exibidas no "suas mais ouvidas". */
const MAX_TOP_TRACKS = 10

/** Textos já traduzidos/interpolados que o formatter precisa. */
export interface OverviewLabels {
  titleNow: string
  titleWas: string
  artistLine: (artist: string) => string
  scrobbles: (count: string) => string
  playtime: (duration: string) => string
  topTracksTitle: string
  hoursMinutes: (hours: number, minutes: number) => string
  minutesOnly: (minutes: number) => string
  /** Locale BCP 47 para formatar números. */
  numberLocale: string
}

/** Monta a mensagem HTML do /pnalbum e /pnartist. */
export function formatOverview(
  overview: EntityOverview,
  kind: 'album' | 'artist',
  labels: OverviewLabels,
): string {
  const lines: string[] = []

  const imageLink =
    overview.imageUrl !== null ? `<a href="${overview.imageUrl}">${INVISIBLE_LINK_TEXT}</a>` : ''
  lines.push(`${imageLink}${overview.nowPlaying ? labels.titleNow : labels.titleWas}`)
  lines.push('')

  const icon = kind === 'album' ? '💿' : '🎤'
  lines.push(`[${icon}] ${linked(overview.name, overview.lastfmUrl)}`)
  if (kind === 'album') {
    lines.push(labels.artistLine(escapeHtml(overview.artistName)))
  }

  const stats: string[] = []
  if (overview.scrobbles !== null) {
    stats.push(labels.scrobbles(overview.scrobbles.toLocaleString(labels.numberLocale)))
  }
  if (overview.playtimeSeconds !== null && overview.playtimeSeconds > 0) {
    const marker = overview.playtimeApproximate ? '≈' : ''
    stats.push(labels.playtime(marker + formatDuration(overview.playtimeSeconds, labels)))
  }
  if (stats.length > 0) lines.push('', ...stats)

  const topTracks = overview.topTracks.slice(0, MAX_TOP_TRACKS)
  if (topTracks.length > 0) {
    lines.push('', labels.topTracksTitle)
    for (const track of topTracks) {
      lines.push(
        `(${track.playcount.toLocaleString(labels.numberLocale)}x) ${linked(track.name, track.url)}`,
      )
    }
  }

  return lines.join('\n')
}

function linked(name: string, url: string | null): string {
  const escaped = escapeHtml(name)
  return url !== null ? `<a href="${url}">${escaped}</a>` : `<b>${escaped}</b>`
}

/** Reuso das durações do now-playing sem arrastar o tipo inteiro para os comandos. */
export type DurationLabels = Pick<NowPlayingLabels, 'hoursMinutes' | 'minutesOnly'>
