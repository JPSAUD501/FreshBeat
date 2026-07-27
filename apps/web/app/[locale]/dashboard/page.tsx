import { computePlaytime } from '@freshbeat/lastfm'
import { Clock3, Disc3, Headphones, LogOut, MicVocal, Music2 } from 'lucide-react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { AccountSection } from '../../../components/dashboard/account-section'
import { DashboardShell } from '../../../components/dashboard/dashboard-shell'
import { HistoryList } from '../../../components/dashboard/history-list'
import { NowPlayingCard } from '../../../components/dashboard/now-playing-card'
import { SettingsSection } from '../../../components/dashboard/settings-section'
import { StatsSection } from '../../../components/dashboard/stats-section'
import { TelegramLoginButton } from '../../../components/telegram-login-button'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { toRecentTrackDto, type TopsDto } from '../../../lib/dashboard-types'
import { isLocale, t, type Locale } from '../../../lib/i18n'
import {
  getRecentTracks,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getUserStats,
} from '../../../lib/lastfm'
import { resolveWebLocale } from '../../../lib/locale'
import { getCacheStore, getConfig, getUserRepository } from '../../../lib/server'
import { decodeSession, SESSION_COOKIE } from '../../../lib/session'
import {
  deleteAccountAction,
  logoutAction,
  setPreferredLocaleAction,
  startLastfmLinkAction,
  unlinkLastfmAction,
} from './actions'

// Sessão via cookie — sempre dinâmico
export const dynamic = 'force-dynamic'

/** Nomes nativos dos idiomas (não se traduzem). */
const LOCALE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Português (BR)',
  'en-US': 'English (US)',
  'ja-JP': '日本語',
  'es-ES': 'Español',
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

async function loadInitialTops(apiKey: string, username: string): Promise<TopsDto | null> {
  const options = { apiKey, cache: getCacheStore() }
  const [tracks, artists, albums] = await Promise.all([
    getTopTracks(options, username, '7day', 50),
    getTopArtists(options, username, '7day', 10),
    getTopAlbums(options, username, '7day', 10),
  ])
  if (tracks === null || artists === null || albums === null) return null
  const playtime = computePlaytime(
    tracks.map((track) => ({
      name: track.name,
      artist: track.artist,
      url: track.url,
      playcount: track.playcount,
      durationSeconds: track.durationSeconds,
    })),
  )
  return {
    tracks: tracks.slice(0, 10),
    artists,
    albums,
    playtime: { totalSeconds: playtime.totalSeconds, estimated: playtime.estimatedShare > 0.2 },
  }
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; goodbye?: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const { error, goodbye } = await searchParams

  const config = getConfig()
  const cookieStore = await cookies()
  const session = decodeSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.web.WEB_SESSION_SECRET,
  )

  // ---- Deslogado: despedida pós-exclusão ou card de login ----
  if (session === null) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-24 sm:px-6">
        <Card className="w-full text-center">
          {goodbye === '1' ? (
            <CardHeader>
              <CardTitle className="font-display text-3xl tracking-tight uppercase">
                {t(locale, 'dashboard.goodbye_title')}
              </CardTitle>
              <p className="pt-2 text-muted-foreground">{t(locale, 'dashboard.goodbye_text')}</p>
            </CardHeader>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="font-display text-3xl tracking-tight uppercase">
                  {t(locale, 'dashboard.title')}
                </CardTitle>
                <p className="pt-2 text-muted-foreground">{t(locale, 'dashboard.login_prompt')}</p>
              </CardHeader>
              <CardContent>
                {error === 'login' && (
                  <p role="alert" className="mb-4 text-sm text-destructive">
                    {t(locale, 'dashboard.login_error')}
                  </p>
                )}
                <TelegramLoginButton
                  botUsername={config.telegram.BOT_USERNAME}
                  authUrl={`${config.web.WEB_BASE_URL}/api/auth/telegram/callback`}
                />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    )
  }

  const user = await getUserRepository().findByTelegramId(session.telegramUserId)

  // Idioma: preferência explícita (banco) > idioma do Telegram (banco) > URL atual
  const resolvedLocale = resolveWebLocale({
    preferredLocale: user?.preferredLocale,
    telegramLocale: user?.telegramLocale,
  })
  if (resolvedLocale !== locale) redirect(`/${resolvedLocale}/dashboard`)

  const lastfmUsername = user?.lastfmUsername ?? null
  const apiKey = config.lastfm.LASTFM_API_KEY

  const [userStats, recentTracks, initialTops] =
    lastfmUsername !== null
      ? await Promise.all([
          getUserStats({ apiKey, cache: getCacheStore() }, lastfmUsername),
          getRecentTracks({ apiKey }, lastfmUsername, 15),
          loadInitialTops(apiKey, lastfmUsername),
        ])
      : [null, null, null]

  const recentDtos = (recentTracks ?? []).map(toRecentTrackDto)
  const nowPlaying = recentDtos.find((track) => track.nowPlaying) ?? null
  const numberFormat = new Intl.NumberFormat(locale)

  const overview = (
    <div className="space-y-4">
      {lastfmUsername === null ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-fb/10 ring-1 ring-fb/30">
              <Music2 className="size-8 text-fb" />
            </div>
            <p className="max-w-sm text-muted-foreground">{t(locale, 'dashboard.empty_stats')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid items-stretch gap-4 lg:grid-cols-3">
            <NowPlayingCard
              className="lg:col-span-2"
              initial={nowPlaying}
              labels={{
                nowPlaying: t(locale, 'dashboard.now_playing'),
                live: t(locale, 'dashboard.live'),
                nothingPlaying: t(locale, 'dashboard.nothing_playing'),
                nothingPlayingHint: t(locale, 'dashboard.nothing_playing_hint'),
              }}
            />
            {initialTops !== null && (
              <Card className="glow-fb border-fb/30">
                <CardHeader>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    <Clock3 className="size-3.5 text-fb" />
                    {t(locale, 'dashboard.listening_time')}
                    <Badge variant="secondary">{t(locale, 'dashboard.stats_period_7day')}</Badge>
                    {initialTops.playtime.estimated && (
                      <Badge variant="secondary">{t(locale, 'dashboard.estimated_badge')}</Badge>
                    )}
                  </CardDescription>
                  <CardTitle className="font-display text-4xl tracking-wide text-fb">
                    {formatDuration(initialTops.playtime.totalSeconds)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'dashboard.listening_time_hint')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          {userStats !== null && (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  ['dashboard.stats_scrobbles', userStats.scrobbles, Headphones],
                  ['dashboard.stats_artists', userStats.artists, MicVocal],
                  ['dashboard.stats_albums', userStats.albums, Disc3],
                  ['dashboard.stats_tracks', userStats.tracks, Music2],
                ] as const
              ).map(([labelKey, value, Icon]) => (
                <Card key={labelKey} className="transition-colors hover:border-fb/30">
                  <CardContent className="py-4">
                    <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-fb/10 text-fb">
                      <Icon className="size-4" />
                    </div>
                    <dd className="font-display text-3xl text-fb tabular-nums">
                      {numberFormat.format(value)}
                    </dd>
                    <dt className="mt-1 text-sm text-muted-foreground">{t(locale, labelKey)}</dt>
                  </CardContent>
                </Card>
              ))}
            </dl>
          )}
          {recentDtos.length > 0 && (
            <HistoryList
              tracks={recentDtos}
              locale={locale}
              labels={{
                title: t(locale, 'dashboard.history_title'),
                repeatCount: t(locale, 'dashboard.repeat_count'),
              }}
            />
          )}
        </>
      )}
    </div>
  )

  const stats =
    lastfmUsername === null || initialTops === null ? (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {lastfmUsername === null
            ? t(locale, 'dashboard.empty_stats')
            : t(locale, 'dashboard.load_error')}
        </CardContent>
      </Card>
    ) : (
      <StatsSection
        initialPeriod="7day"
        initialData={initialTops}
        labels={{
          periods: {
            '7day': t(locale, 'dashboard.stats_period_7day'),
            '1month': t(locale, 'dashboard.stats_period_1month'),
            overall: t(locale, 'dashboard.stats_period_overall'),
          },
          topTracks: t(locale, 'dashboard.top_tracks'),
          topArtists: t(locale, 'dashboard.top_artists'),
          topAlbums: t(locale, 'dashboard.top_albums'),
          plays: t(locale, 'dashboard.plays'),
          listeningTime: t(locale, 'dashboard.listening_time'),
          estimatedBadge: t(locale, 'dashboard.estimated_badge'),
          listeningTimeHint: t(locale, 'dashboard.listening_time_hint'),
          loadError: t(locale, 'dashboard.load_error'),
          statsEmpty: t(locale, 'dashboard.stats_empty'),
          statsEmptyHint: t(locale, 'dashboard.stats_empty_hint'),
        }}
      />
    )

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-16 sm:px-6">
      {/* Header: avatar + saudação + logout */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11 ring-2 ring-fb/50 ring-offset-2 ring-offset-background">
            {session.photoUrl !== null && <AvatarImage src={session.photoUrl} alt="" />}
            <AvatarFallback className="bg-fb/15 font-display text-fb">
              {session.firstName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl tracking-tight uppercase sm:text-4xl">
              {t(locale, 'dashboard.hello', { name: session.firstName })}
            </h1>
            {lastfmUsername !== null && (
              <a
                href={`https://www.last.fm/user/${encodeURIComponent(lastfmUsername)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-fb hover:underline"
              >
                <Music2 className="size-3.5" />
                {lastfmUsername}
              </a>
            )}
          </div>
        </div>
        <form action={logoutAction.bind(null, locale)}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut />
            {t(locale, 'dashboard.logout')}
          </Button>
        </form>
      </div>

      <DashboardShell
        labels={{
          overview: t(locale, 'dashboard.tab_overview'),
          stats: t(locale, 'dashboard.tab_stats'),
          account: t(locale, 'dashboard.tab_account'),
          settings: t(locale, 'dashboard.tab_settings'),
        }}
        overview={overview}
        stats={stats}
        account={
          <AccountSection
            locale={locale}
            lastfmUsername={lastfmUsername}
            labels={{
              linkedAs: t(locale, 'dashboard.linked_as'),
              viewProfile: t(locale, 'dashboard.view_profile'),
              linkLastfm: t(locale, 'dashboard.link_lastfm'),
              linkLastfmHint: t(locale, 'dashboard.link_lastfm_hint'),
              unlink: t(locale, 'dashboard.unlink'),
              unlinkTitle: t(locale, 'dashboard.unlink_title'),
              unlinkConfirm: t(locale, 'dashboard.unlink_confirm'),
              cancel: t(locale, 'dashboard.cancel'),
              confirm: t(locale, 'dashboard.confirm'),
              toastUnlinked: t(locale, 'dashboard.toast_unlinked'),
            }}
            actions={{
              startLink: startLastfmLinkAction,
              unlink: unlinkLastfmAction,
            }}
          />
        }
        settings={
          <SettingsSection
            locale={locale}
            preferredLocale={user?.preferredLocale ?? null}
            localeNames={LOCALE_NAMES}
            labels={{
              languageLabel: t(locale, 'dashboard.language_label'),
              languageHint: t(locale, 'dashboard.language_hint'),
              languageAuto: t(locale, 'dashboard.language_auto'),
              dangerZone: t(locale, 'dashboard.danger_zone'),
              deleteAccount: t(locale, 'dashboard.delete_account'),
              deleteHint: t(locale, 'dashboard.delete_hint'),
              deleteTitle: t(locale, 'dashboard.delete_title'),
              deleteConfirmText: t(locale, 'dashboard.delete_confirm_text'),
              deleteButton: t(locale, 'dashboard.delete_button'),
              cancel: t(locale, 'dashboard.cancel'),
              confirm: t(locale, 'dashboard.confirm'),
              toastLanguageSaved: t(locale, 'dashboard.toast_language_saved'),
            }}
            actions={{
              setPreferredLocale: setPreferredLocaleAction,
              deleteAccount: deleteAccountAction,
            }}
          />
        }
      />
    </div>
  )
}
