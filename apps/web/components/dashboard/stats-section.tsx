'use client'

import { Clock3, Disc3, MicVocal, Music2, type LucideIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import type { TopsDto } from '../../lib/dashboard-types'
import type { LastfmPeriod } from '../../lib/lastfm'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface StatsSectionLabels {
  periods: Record<LastfmPeriod, string>
  topTracks: string
  topArtists: string
  topAlbums: string
  plays: string // template com {{count}}
  listeningTime: string
  estimatedBadge: string
  listeningTimeHint: string
  loadError: string
  statsEmpty: string
  statsEmptyHint: string
}

interface StatsSectionProps {
  initialPeriod: LastfmPeriod
  initialData: TopsDto
  labels: StatsSectionLabels
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

interface RankedItem {
  key: string
  title: string
  subtitle: string | null
  image: string | null
  playcount: number
}

/** Card do #1 de cada categoria, com a capa desfocada ao fundo. */
function ChampionCard({
  item,
  playsTemplate,
  icon: Icon,
}: {
  item: RankedItem
  playsTemplate: string
  icon: LucideIcon
}) {
  return (
    <Card className="relative overflow-hidden transition-colors hover:border-fb/40">
      {item.image !== null && (
        <>
          <img
            src={item.image}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full scale-150 object-cover opacity-20 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/50"
          />
        </>
      )}
      <CardContent className="relative flex items-center gap-4 py-5">
        {item.image !== null ? (
          <img
            src={item.image}
            alt=""
            className="size-16 shrink-0 rounded-xl object-cover shadow-lg ring-1 ring-white/15"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-fb/10 ring-1 ring-fb/20">
            <Icon className="size-7 text-fb" />
          </div>
        )}
        <div className="min-w-0">
          <Badge className="mb-1.5">#1</Badge>
          <p className="truncate font-display text-lg leading-tight tracking-wide">{item.title}</p>
          {item.subtitle !== null && (
            <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
          )}
          <p className="mt-0.5 text-xs font-semibold text-fb">
            {playsTemplate.replace('{{count}}', item.playcount.toLocaleString())}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** Lista rankeada com barra de proporção do playcount. */
function RankedList({ items, playsTemplate }: { items: RankedItem[]; playsTemplate: string }) {
  const max = Math.max(...items.map((item) => item.playcount), 1)
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50"
        >
          <span
            className={cn(
              'w-5 text-right font-display text-lg',
              index < 3 ? 'text-fb' : 'text-muted-foreground',
            )}
          >
            {index + 1}
          </span>
          {item.image !== null ? (
            <img
              src={item.image}
              alt=""
              className="size-10 rounded-md object-cover ring-1 ring-white/5 transition-all group-hover:ring-fb/40"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-md bg-muted ring-1 ring-white/5">
              <Music2 className="size-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {playsTemplate.replace('{{count}}', item.playcount.toLocaleString())}
              </span>
            </div>
            {item.subtitle !== null && (
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            )}
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fb to-fb/40 transition-all duration-500"
                style={{ width: `${Math.round((item.playcount / max) * 100)}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Card de ranking com ícone no header. */
function RankedCard({
  title,
  icon: Icon,
  items,
  playsTemplate,
}: {
  title: string
  icon: LucideIcon
  items: RankedItem[]
  playsTemplate: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-fb/10 text-fb">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RankedList items={items} playsTemplate={playsTemplate} />
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((column) => (
        <div key={column} className="space-y-3">
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-1 w-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/** Stats com abas de período — troca busca /api/me/tops e mostra skeletons. */
export function StatsSection({ initialPeriod, initialData, labels }: StatsSectionProps) {
  const [period, setPeriod] = useState<LastfmPeriod>(initialPeriod)
  const [data, setData] = useState<TopsDto>(initialData)
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function changePeriod(next: string) {
    const nextPeriod = next as LastfmPeriod
    setPeriod(nextPeriod)
    setError(false)
    startTransition(async () => {
      try {
        const response = await fetch(`/api/me/tops?period=${nextPeriod}`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setData((await response.json()) as TopsDto)
      } catch {
        setError(true)
      }
    })
  }

  const trackItems: RankedItem[] = data.tracks.map((track) => ({
    key: `t-${track.name}-${track.artist}`,
    title: track.name,
    subtitle: track.artist,
    image: track.image,
    playcount: track.playcount,
  }))
  const artistItems: RankedItem[] = data.artists.map((artist) => ({
    key: `ar-${artist.name}`,
    title: artist.name,
    subtitle: null,
    image: null, // a API não manda imagem de artista no user.getTopArtists
    playcount: artist.playcount,
  }))
  const albumItems: RankedItem[] = data.albums.map((album) => ({
    key: `al-${album.name}-${album.artist}`,
    title: album.name,
    subtitle: album.artist,
    image: album.image,
    playcount: album.playcount,
  }))

  const isEmpty = trackItems.length === 0 && artistItems.length === 0 && albumItems.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={period} onValueChange={changePeriod}>
          <TabsList>
            {(Object.keys(labels.periods) as LastfmPeriod[]).map((value) => (
              <TabsTrigger key={value} value={value}>
                {labels.periods[value]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card className="glow-fb w-full border-fb/30 sm:w-auto">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock3 className="size-3.5 text-fb" />
              {labels.listeningTime}
              {data.playtime.estimated && (
                <Badge variant="secondary">{labels.estimatedBadge}</Badge>
              )}
            </CardDescription>
            <CardTitle className="font-display text-3xl tracking-wide text-fb">
              {formatDuration(data.playtime.totalSeconds)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{labels.listeningTimeHint}</p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {labels.loadError}
          </CardContent>
        </Card>
      ) : isPending ? (
        <StatsSkeleton />
      ) : isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-fb/10 ring-1 ring-fb/30">
              <Music2 className="size-7 text-fb" />
            </div>
            <p className="font-semibold">{labels.statsEmpty}</p>
            <p className="text-sm text-muted-foreground">{labels.statsEmptyHint}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {trackItems[0] !== undefined && (
              <ChampionCard item={trackItems[0]} playsTemplate={labels.plays} icon={Music2} />
            )}
            {artistItems[0] !== undefined && (
              <ChampionCard item={artistItems[0]} playsTemplate={labels.plays} icon={MicVocal} />
            )}
            {albumItems[0] !== undefined && (
              <ChampionCard item={albumItems[0]} playsTemplate={labels.plays} icon={Disc3} />
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <RankedCard
              title={labels.topTracks}
              icon={Music2}
              items={trackItems}
              playsTemplate={labels.plays}
            />
            <RankedCard
              title={labels.topArtists}
              icon={MicVocal}
              items={artistItems}
              playsTemplate={labels.plays}
            />
            <RankedCard
              title={labels.topAlbums}
              icon={Disc3}
              items={albumItems}
              playsTemplate={labels.plays}
            />
          </div>
        </>
      )}
    </div>
  )
}
