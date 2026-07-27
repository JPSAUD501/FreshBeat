import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface MarqueeProps {
  children: ReactNode
  className?: string
  /** Duração do loop em segundos */
  duration?: number
}

/**
 * Faixa infinita (conteúdo duplicado + keyframe `marquee` que translada -50%).
 * Pausa no hover; respeita prefers-reduced-motion via globals.css.
 */
export function Marquee({ children, className, duration = 30 }: MarqueeProps) {
  return (
    <div className={cn('group overflow-hidden whitespace-nowrap', className)} aria-hidden>
      <div
        className="inline-flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        <span className="flex items-center">{children}</span>
        <span className="flex items-center">{children}</span>
      </div>
    </div>
  )
}
