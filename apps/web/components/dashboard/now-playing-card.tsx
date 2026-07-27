'use client'

import { Music2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { RecentTrackDto } from '../../lib/dashboard-types'
import { cn } from '../../lib/utils'
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

/** Barras de equalizador animadas (visível apenas quando há faixa ao vivo). */
function EqualizerBars({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('flex items-end gap-[3px]', className)}>
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-1 origin-bottom animate-equalizer rounded-full bg-fb"
          style={{ height: '100%', animationDelay: `${bar * 0.2}s` }}
        />
      ))}
    </span>
  )
}

/** Card "Tocando agora" — fundo com a capa desfocada, badge AO VIVO e auto-refresh de 20s. */
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
    <Card className={cn('relative overflow-hidden', track !== null && 'glow-fb border-fb/40')}>
      {/* Fundo: capa desfocada + véu para legibilidade */}
      {track?.image != null && (
        <>
          <img
            src={track.image}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full scale-150 object-cover opacity-25 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/40"
          />
        </>
      )}

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3">
          {labels.nowPlaying}
          {track !== null && (
            <>
              <Badge className="animate-pulse-glow gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
                </span>
                {labels.live}
              </Badge>
              <EqualizerBars className="h-4" />
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {track !== null ? (
          <div className="flex items-center gap-5">
            {track.image !== null ? (
              <img
                src={track.image}
                alt=""
                className="size-24 rounded-xl object-cover shadow-lg ring-1 ring-white/15"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-xl bg-gradient-to-br from-fb/60 to-fb/10 ring-1 ring-white/10">
                <Music2 className="size-10 text-white/90" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-2xl tracking-wide">{track.name}</p>
              <p className="truncate text-lg text-muted-foreground">{track.artist}</p>
              {track.album !== null && (
                <p className="truncate text-sm text-muted-foreground/70">{track.album}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div className="flex size-24 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/40 ring-1 ring-white/5">
              <Music2 className="size-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-xl tracking-wide">{labels.nothingPlaying}</p>
              <p className="text-sm text-muted-foreground">{labels.nothingPlayingHint}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
