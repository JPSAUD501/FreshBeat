import { GITHUB_URL } from '../../lib/env'
import { GithubIcon } from '../github-icon'
import { Reveal } from '../motion/reveal'

interface OpenSourceProps {
  title: string
  text: string
  ctaLabel: string
}

/** Seção open source: painel com glow radial e CTA para o GitHub. */
export function OpenSource({ title, text, ctaLabel }: OpenSourceProps) {
  return (
    <Reveal className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:py-20">
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-fb/10 blur-3xl"
        />
        <div className="relative flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-fb/30 bg-fb/10">
            <GithubIcon className="size-7 text-fb" />
          </div>
          <h2 className="mt-5 font-display text-4xl tracking-tight uppercase sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{text}</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-fb px-8 py-3 font-semibold text-fb transition-colors hover:bg-fb hover:text-primary-foreground"
          >
            <GithubIcon className="size-4" />
            {ctaLabel}
          </a>
        </div>
      </div>
    </Reveal>
  )
}
