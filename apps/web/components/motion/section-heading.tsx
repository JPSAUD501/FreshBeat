import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Reveal } from './reveal'

interface SectionHeadingProps {
  /** Rótulo pequeno acima do título (ex: "01 — STATS") */
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

/** Cabeçalho editorial de seção: eyebrow + título display + descrição, com reveal. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow !== undefined && (
        <span className="text-sm font-semibold tracking-[0.25em] text-fb uppercase">{eyebrow}</span>
      )}
      <h2 className="font-display text-4xl tracking-tight uppercase sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description !== undefined && (
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      )}
    </Reveal>
  )
}
