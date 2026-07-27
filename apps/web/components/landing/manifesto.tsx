'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

interface ManifestoProps {
  /** Linhas do manifesto — cada palavra acende conforme o scroll avança */
  lines: string[]
}

/** Manifesto editorial: texto grande com reveal palavra a palavra atrelado ao scroll. */
export function Manifesto({ lines }: ManifestoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  })

  const words = lines.flatMap((line, lineIndex) =>
    line.split(' ').map((word) => ({ word, lineIndex })),
  )

  return (
    <div ref={ref} className="mx-auto max-w-4xl px-4 sm:px-6">
      <p className="font-display text-3xl leading-snug tracking-tight uppercase sm:text-5xl sm:leading-tight">
        {words.map((item, index) => (
          <Word
            key={`${item.lineIndex}-${index}`}
            progress={scrollYProgress}
            range={[index / words.length, (index + 1) / words.length]}
            accent={item.lineIndex === 1}
          >
            {item.word}
          </Word>
        ))}
      </p>
    </div>
  )
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  accent: boolean
}) {
  const opacity = useTransform(progress, range, [0.12, 1])
  return (
    <motion.span style={{ opacity }} className={accent ? 'text-fb' : undefined}>
      {children}{' '}
    </motion.span>
  )
}
