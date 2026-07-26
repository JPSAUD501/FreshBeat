import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '../../../components/confirm-submit-button'
import { TelegramLoginButton } from '../../../components/telegram-login-button'
import { isLocale, t } from '../../../lib/i18n'
import { fetchLastfmUserStats } from '../../../lib/lastfm-user'
import { getConfig, getUserRepository } from '../../../lib/server'
import { decodeSession, SESSION_COOKIE } from '../../../lib/session'
import { logoutAction, unlinkLastfmAction } from './actions'

// Sessão via cookie — sempre dinâmico
export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const { error } = await searchParams

  const config = getConfig()
  const cookieStore = await cookies()
  const session = decodeSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.web.WEB_SESSION_SECRET,
  )

  if (session === null) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center">
          <h1 className="text-2xl font-bold">{t(locale, 'dashboard.title')}</h1>
          <p className="mt-4 text-muted">{t(locale, 'dashboard.login_prompt')}</p>
          {error === 'login' && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {t(locale, 'dashboard.login_error')}
            </p>
          )}
          <div className="mt-6">
            <TelegramLoginButton
              botUsername={config.telegram.BOT_USERNAME}
              authUrl={`${config.web.WEB_BASE_URL}/api/auth/telegram/callback`}
            />
          </div>
        </div>
      </div>
    )
  }

  const user = await getUserRepository().findByTelegramId(session.telegramUserId)
  const lastfmUsername = user?.lastfmUsername ?? null
  const stats =
    lastfmUsername !== null
      ? await fetchLastfmUserStats(config.lastfm.LASTFM_API_KEY, lastfmUsername)
      : null

  const numberFormat = new Intl.NumberFormat(locale)

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">
        {t(locale, 'dashboard.hello', { name: session.firstName })}
      </h1>

      <section className="mt-8 rounded-2xl bg-surface p-6">
        <h2 className="text-lg font-semibold">{t(locale, 'dashboard.linked_as')}</h2>
        {lastfmUsername !== null ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <a
              href={`https://www.last.fm/user/${encodeURIComponent(lastfmUsername)}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              {lastfmUsername}
            </a>
            <form action={unlinkLastfmAction.bind(null, locale)}>
              <ConfirmSubmitButton
                label={t(locale, 'dashboard.unlink')}
                confirmText={t(locale, 'dashboard.unlink_confirm')}
                className="rounded-full border border-red-400 px-4 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-400/10"
              />
            </form>
          </div>
        ) : (
          <p className="mt-3 text-muted">{t(locale, 'dashboard.not_linked')}</p>
        )}
      </section>

      {stats !== null && (
        <section className="mt-6 rounded-2xl bg-surface p-6">
          <h2 className="text-lg font-semibold">{t(locale, 'dashboard.stats_title')}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                ['dashboard.stats_scrobbles', stats.scrobbles],
                ['dashboard.stats_artists', stats.artists],
                ['dashboard.stats_albums', stats.albums],
                ['dashboard.stats_tracks', stats.tracks],
              ] as const
            ).map(([labelKey, value]) => (
              <div key={labelKey} className="rounded-xl bg-background p-4 text-center">
                <dt className="text-sm text-muted">{t(locale, labelKey)}</dt>
                <dd className="mt-1 text-2xl font-bold text-accent">
                  {numberFormat.format(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <form action={logoutAction.bind(null, locale)} className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-muted px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          {t(locale, 'dashboard.logout')}
        </button>
      </form>
    </div>
  )
}
