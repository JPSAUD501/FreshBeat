import { getCatalog } from '@freshbeat/i18n'
import { notFound } from 'next/navigation'
import { GITHUB_URL, TELEGRAM_BOT_URL } from '../../lib/env'
import { isLocale, t } from '../../lib/i18n'

/** Descrições vêm do catálogo do bot — fonte única, sempre traduzidas. */
const COMMAND_NAMES = [
  'start',
  'login',
  'playingnow',
  'pnalbum',
  'pnartist',
  'lyrics',
  'history',
  'brief',
  'help',
  'forgetme',
] as const

const FEATURES = [
  { titleKey: 'landing.feature_stats_title', textKey: 'landing.feature_stats_text' },
  { titleKey: 'landing.feature_lyrics_title', textKey: 'landing.feature_lyrics_text' },
  { titleKey: 'landing.feature_ai_title', textKey: 'landing.feature_ai_text' },
] as const

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const catalog = getCatalog(locale)

  return (
    <div className="py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">🎧 FreshBeat</h1>
        <p className="mt-2 text-xl text-accent">{t(locale, 'landing.hero_title')}</p>
        <p className="mx-auto mt-4 max-w-2xl text-muted">{t(locale, 'landing.hero_subtitle')}</p>
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-lg font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          {t(locale, 'landing.cta')}
        </a>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold">{t(locale, 'landing.features_title')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.titleKey} className="rounded-xl bg-surface p-5">
              <h3 className="font-semibold">{t(locale, feature.titleKey)}</h3>
              <p className="mt-2 text-sm text-muted">{t(locale, feature.textKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold">{t(locale, 'landing.commands_title')}</h2>
        <ul className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
          {COMMAND_NAMES.map((name) => (
            <li key={name} className="rounded-lg bg-surface px-4 py-3 text-sm">
              <code className="font-semibold text-accent">/{name}</code>
              <span className="mt-1 block text-muted">
                {catalog[`cmd.${name}.description`] ?? ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 text-center">
        <h2 className="text-2xl font-bold">{t(locale, 'landing.open_source')}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">{t(locale, 'landing.opensource_text')}</p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-full border border-accent px-6 py-2 font-semibold text-accent transition-colors hover:bg-surface"
        >
          GitHub
        </a>
      </section>
    </div>
  )
}
