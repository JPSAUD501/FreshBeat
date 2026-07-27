import { Music2 } from 'lucide-react'
import type { RecentTrackDto } from '../../lib/dashboard-types'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface HistoryListProps {
  tracks: RecentTrackDto[]
  locale: string
  labels: {
    title: string
    repeatCount: string // template com {{count}}
  }
}

interface HistoryEntry {
  track: RecentTrackDto
  /** Repetições consecutivas da mesma faixa (1 = tocou uma vez). */
  count: number
}

/** Colapsa repetições consecutivas da mesma faixa (ex.: ×3). */
function collapseRepeats(tracks: RecentTrackDto[]): HistoryEntry[] {
  const entries: HistoryEntry[] = []
  for (const track of tracks) {
    const last = entries[entries.length - 1]
    if (
      last !== undefined &&
      last.track.name === track.name &&
      last.track.artist === track.artist
    ) {
      last.count += 1
    } else {
      entries.push({ track, count: 1 })
    }
  }
  return entries
}

function formatPlayedAt(iso: string | null, locale: string): string {
  if (iso === null) return ''
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

/** Histórico recente do Last.fm com repetições colapsadas. */
export function HistoryList({ tracks, locale, labels }: HistoryListProps) {
  const entries = collapseRepeats(tracks)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {entries.map(({ track, count }, index) => (
            <li
              key={`${track.name}-${track.artist}-${index}`}
              className="group flex items-center gap-3 py-2.5 transition-colors first:pt-0 hover:bg-secondary/30"
            >
              {track.image !== null ? (
                <img
                  src={track.image}
                  alt=""
                  className="size-10 rounded-md object-cover ring-1 ring-white/5 transition-all group-hover:ring-fb/40"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-md bg-muted ring-1 ring-white/5">
                  <Music2 className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{track.name}</p>
                <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
              </div>
              {count > 1 && (
                <Badge variant="secondary">
                  {labels.repeatCount.replace('{{count}}', String(count))}
                </Badge>
              )}
              <span className="flex w-12 items-center justify-end text-right text-xs text-muted-foreground tabular-nums">
                {track.nowPlaying ? (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-fb opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-fb" />
                  </span>
                ) : (
                  formatPlayedAt(track.playedAt, locale)
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
