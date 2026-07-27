import { GITHUB_URL } from '../../lib/env'
import { GithubIcon } from '../github-icon'
import { Reveal } from '../motion/reveal'

interface OpenSourceProps {
  title: string
  text: string
  ctaLabel: string
}

/** Seção open source: código aberto de verdade, com CTA para o GitHub. */
export function OpenSource({ title, text, ctaLabel }: OpenSourceProps) {
  return (
    <Reveal className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
      <GithubIcon className="size-10 text-fb" />
      <h2 className="mt-4 font-display text-4xl tracking-tight uppercase sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg text-muted-foreground">{text}</p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-fb px-8 py-3 font-semibold text-fb transition-colors hover:bg-fb hover:text-primary-foreground"
      >
        <GithubIcon className="size-4" />
        {ctaLabel}
      </a>
    </Reveal>
  )
}
