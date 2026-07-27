'use client'

import { ChevronDown } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useRef } from 'react'

interface HeroProps {
  manifesto: string
  ctaLabel: string
  scrollHint: string
  botUrl: string
}

const TITLE = 'FRESHBEAT'

/** Hero cinematográfico: título gigante com reveal por letra sobre arte em parallax. */
export function Hero({ manifesto, ctaLabel, scrollHint, botUrl }: HeroProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Arte de fundo em parallax */}
      <motion.div style={{ y: artY }} className="absolute inset-0 -z-10">
        <Image
          src="/art/hero-waves.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pt-24 text-center sm:px-6"
      >
        <h1
          aria-label={TITLE}
          className="font-display text-[clamp(3.5rem,14vw,11rem)] leading-none tracking-tight"
        >
          {TITLE.split('').map((letter, index) => (
            <motion.span
              key={index}
              aria-hidden
              className="inline-block"
              initial={{ opacity: 0, y: 80, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.06 * index, ease: [0.21, 0.65, 0.35, 1] }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          {manifesto}
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          href={botUrl}
          target="_blank"
          rel="noreferrer"
          className="animate-pulse-glow mt-10 rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-fb-hover"
        >
          {ctaLabel}
        </motion.a>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: fade }}
        className="flex flex-col items-center gap-1 pb-8 text-muted-foreground"
      >
        <span className="text-xs tracking-[0.25em] uppercase">{scrollHint}</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="size-5" />
        </motion.span>
      </motion.div>
    </section>
  )
}
