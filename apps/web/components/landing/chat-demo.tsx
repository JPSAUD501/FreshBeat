'use client'

import { Music2 } from 'lucide-react'
import { motion } from 'motion/react'

interface ChatDemoLabels {
  nowPlaying: string
  scrobbles: string
  btnLyrics: string
  btnMeaning: string
  btnArt: string
}

const bubble = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay, ease: [0.21, 0.65, 0.35, 1] as const },
  }),
}

/**
 * Demo de conversa: um /playingnow e a resposta realista do bot,
 * montados como mensagens animadas — o produto se mostrando.
 */
export function ChatDemo({ labels }: { labels: ChatDemoLabels }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-120px' }}
      className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-[#0e1621] p-5 shadow-2xl"
    >
      {/* Mensagem do usuário */}
      <motion.div variants={bubble} custom={0.1} className="flex justify-end">
        <span className="rounded-2xl rounded-br-sm bg-[#2b5278] px-4 py-2 font-mono text-sm text-white">
          /playingnow
        </span>
      </motion.div>

      {/* Card do bot */}
      <motion.div
        variants={bubble}
        custom={0.6}
        className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#182533] p-4"
      >
        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-fb uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-fb opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-fb" />
          </span>
          {labels.nowPlaying}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fb/60 to-fb/10">
            <Music2 className="size-7 text-white/90" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">Midnight City</p>
            <p className="truncate text-sm text-white/70">M83</p>
            <p className="truncate text-xs text-white/50">Hurry Up, We&apos;re Dreaming</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/60">{labels.scrobbles}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {[labels.btnLyrics, labels.btnMeaning, labels.btnArt].map((label) => (
            <span
              key={label}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/85"
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
