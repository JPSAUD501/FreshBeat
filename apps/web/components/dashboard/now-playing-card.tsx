'use client'

import { Music2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { RecentTrackDto } from '../../lib/dashboard-types'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface NowPlayingCardProps {
  initial: RecentTrackDto | null
  labels: {
    nowPlaying: string
    live: string
    nothingPlaying: string
    nothingPlayingHint: string
  }
}

const REFRESH_INTERVAL_MS = 20_000

/** Card "Tocando agora" com badge AO VIVO pulsante e auto-refresh de 20s. */
export function NowPlayingCard({ initial, labels }: NowPlayingCardProps) {
  const [track, setTrack] = useState<RecentTrackDto | null>(initial)

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch('/api/me/now-playing', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as { track: RecentTrackDto | null }
        setTrack(data.track)
      } catch {
        // Falha de rede silenciosa — mantém o último estado conhecido
      }
    }
    const interval = setInterval(() => void refresh(), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className={track !== null ? 'glow-fb border-fb/40' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {labels.nowPlaying}
          {track !== null && (
            <Badge className="animate-pulse-glow gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
              </span>
              {labels.live}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {track !== null ? (
          <div className="flex items-center gap-4">
            {track.image !== null ? (
              <img src={track.image} alt="" className="size-20 rounded-lg object-cover" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-lg bg-gradient-to-br from-fb/60 to-fb/10">
                <Music2 className="size-8 text-white/90" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{track.name}</p>
              <p className="truncate text-muted-foreground">{track.artist}</p>
              {track.album !== null && (
                <p className="truncate text-sm text-muted-foreground/70">{track.album}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-lg bg-muted">
              <Music2 className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{labels.nothingPlaying}</p>
              <p className="text-sm text-muted-foreground">{labels.nothingPlayingHint}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
