import Image from 'next/image'
import { Parallax } from '../motion/parallax'
import { Reveal } from '../motion/reveal'

interface FinalCtaProps {
  title: string
  text: string
  ctaLabel: string
  botUrl: string
}

/** CTA final gigante sobre a arte de ondas em parallax. */
export function FinalCta({ title, text, ctaLabel, botUrl }: FinalCtaProps) {
  return (
    <div className="relative overflow-hidden">
      <Parallax offset={48} className="absolute inset-0 -z-10">
        <Image
          src="/art/hero-waves.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </Parallax>

      <Reveal className="mx-auto flex max-w-4xl flex-col items-center px-4 py-32 text-center sm:px-6 sm:py-40">
        <h2 className="font-display text-[clamp(3rem,10vw,7rem)] leading-none tracking-tight uppercase">
          {title}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{text}</p>
        <a
          href={botUrl}
          target="_blank"
          rel="noreferrer"
          className="animate-pulse-glow mt-10 rounded-full bg-primary px-12 py-4 text-xl font-semibold text-primary-foreground transition-colors hover:bg-fb-hover"
        >
          {ctaLabel}
        </a>
      </Reveal>
    </div>
  )
}
