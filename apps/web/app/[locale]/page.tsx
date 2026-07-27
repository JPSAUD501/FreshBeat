import { notFound } from 'next/navigation'
import { ChatDemo } from '../../components/landing/chat-demo'
import { CommandList } from '../../components/landing/command-list'
import { Features } from '../../components/landing/features'
import { FinalCta } from '../../components/landing/final-cta'
import { Hero } from '../../components/landing/hero'
import { HowItWorks } from '../../components/landing/how-it-works'
import { Manifesto } from '../../components/landing/manifesto'
import { OpenSource } from '../../components/landing/open-source'
import { Marquee } from '../../components/motion/marquee'
import { SectionHeading } from '../../components/motion/section-heading'
import { TELEGRAM_BOT_URL } from '../../lib/env'
import { isLocale, t } from '../../lib/i18n'

/** Agrupamento editorial dos comandos — descrições ricas vivem no i18n do site. */
const COMMAND_GROUPS = [
  {
    categoryKey: 'landing.cmdcat_stats',
    names: ['playingnow', 'pnalbum', 'pnartist', 'history', 'brief'],
  },
  { categoryKey: 'landing.cmdcat_lyrics', names: ['lyrics'] },
  { categoryKey: 'landing.cmdcat_account', names: ['start', 'login', 'help', 'forgetme'] },
] as const

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw

  const groups = COMMAND_GROUPS.map((group) => ({
    label: t(locale, group.categoryKey),
    commands: group.names.map((name) => ({
      name,
      description: t(locale, `landing.cmd_${name}`),
    })),
  }))

  return (
    <>
      <Hero
        manifesto={t(locale, 'landing.hero_manifesto')}
        ctaLabel={t(locale, 'landing.cta')}
        scrollHint={t(locale, 'landing.scroll_hint')}
        botUrl={TELEGRAM_BOT_URL}
      />

      <Marquee className="border-y border-border py-4" duration={28}>
        <span className="font-display text-2xl tracking-wide text-muted-foreground uppercase sm:text-3xl">
          {t(locale, 'landing.marquee').repeat(4)}
        </span>
      </Marquee>

      <section className="py-28 sm:py-36">
        <Manifesto
          lines={[
            t(locale, 'landing.manifesto_1'),
            t(locale, 'landing.manifesto_2'),
            t(locale, 'landing.manifesto_3'),
          ]}
        />
      </section>

      <section className="py-20">
        <HowItWorks
          title={t(locale, 'landing.how_title')}
          steps={[
            {
              title: t(locale, 'landing.how_step1_title'),
              text: t(locale, 'landing.how_step1_text'),
            },
            {
              title: t(locale, 'landing.how_step2_title'),
              text: t(locale, 'landing.how_step2_text'),
            },
            {
              title: t(locale, 'landing.how_step3_title'),
              text: t(locale, 'landing.how_step3_text'),
            },
          ]}
        />
      </section>

      <section className="py-24 sm:py-32">
        <SectionHeading
          title={t(locale, 'landing.demo_title')}
          description={t(locale, 'landing.demo_subtitle')}
          align="center"
          className="mb-14 px-4"
        />
        <ChatDemo
          labels={{
            nowPlaying: t(locale, 'landing.demo_now_playing'),
            scrobbles: t(locale, 'landing.demo_scrobbles', { count: 128 }),
            btnLyrics: t(locale, 'landing.demo_btn_lyrics'),
            btnMeaning: t(locale, 'landing.demo_btn_meaning'),
            btnArt: t(locale, 'landing.demo_btn_art'),
            typing: t(locale, 'landing.demo_typing'),
            aiCaption: t(locale, 'landing.demo_ai_caption'),
          }}
        />
      </section>

      <section className="py-24 sm:py-32">
        <Features
          features={[
            {
              eyebrow: t(locale, 'landing.feature1_eyebrow'),
              title: t(locale, 'landing.feature1_title'),
              text: t(locale, 'landing.feature1_text'),
              image: { src: '/art/stats-equalizer.webp', alt: '' },
            },
            {
              eyebrow: t(locale, 'landing.feature2_eyebrow'),
              title: t(locale, 'landing.feature2_title'),
              text: t(locale, 'landing.feature2_text'),
              image: { src: '/art/manifesto-texture.webp', alt: '' },
            },
            {
              eyebrow: t(locale, 'landing.feature3_eyebrow'),
              title: t(locale, 'landing.feature3_title'),
              text: t(locale, 'landing.feature3_text'),
              image: { src: '/art/ai-collage.webp', alt: '' },
            },
          ]}
        />
      </section>

      <section className="py-24 sm:py-32">
        <SectionHeading
          title={t(locale, 'landing.commands_title')}
          description={t(locale, 'landing.commands_hint')}
          align="center"
          className="mb-14 px-4"
        />
        <div className="px-4 sm:px-6">
          <CommandList groups={groups} />
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <OpenSource
          title={t(locale, 'landing.opensource_title')}
          text={t(locale, 'landing.opensource_text')}
          ctaLabel={t(locale, 'landing.opensource_cta')}
        />
      </section>

      <FinalCta
        title={t(locale, 'landing.final_cta_title')}
        text={t(locale, 'landing.final_cta_text')}
        ctaLabel={t(locale, 'landing.cta')}
        botUrl={TELEGRAM_BOT_URL}
      />
    </>
  )
}
