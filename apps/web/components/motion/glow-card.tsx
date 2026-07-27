'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
}

/** Card com brilho verde que segue o cursor (spotlight). */
export function GlowCard({ children, className }: GlowCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgb(29 185 84 / 0.12), transparent 80%)`

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
