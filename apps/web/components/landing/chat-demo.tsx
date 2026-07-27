'use client'

import { Battery, Check, CheckCheck, Signal, Wifi } from 'lucide-react'
import { motion } from 'motion/react'

interface ChatDemoLabels {
  nowPlaying: string
  scrobbles: string
  btnLyrics: string
  btnMeaning: string
  btnArt: string
  typing: string
  aiCaption: string
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

function TimeStamp({ time, read = false }: { time: string; read?: boolean }) {
  return (
    <span className="ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px] text-white/40">
      {time}
      {read ? <CheckCheck className="size-3 text-[#64b5ef]" /> : <Check className="size-3" />}
    </span>
  )
}

/**
 * Demo de conversa: um frame de celular com o Telegram aberto —
 * /playingnow, typing, card do bot e a arte por IA, em sequência animada.
 */
export function ChatDemo({ labels }: { labels: ChatDemoLabels }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-120px' }}
      className="relative mx-auto w-full max-w-[340px]"
    >
      {/* Glow atrás do aparelho */}
      <div aria-hidden className="absolute -inset-8 rounded-[4rem] bg-fb/15 blur-3xl" />

      {/* Frame do celular */}
      <div className="relative overflow-hidden rounded-[2.75rem] border border-white/12 bg-[#0b0f14] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[#17212b] px-7 pt-4 pb-1 text-[11px] font-medium text-white/80">
          <span>21:47</span>
          <span className="flex items-center gap-1.5">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <Battery className="size-4" />
          </span>
        </div>

        {/* Header do Telegram */}
        <div className="flex items-center gap-3 bg-[#17212b] px-5 py-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-fb font-display text-sm tracking-wide text-black">
            FB
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">FreshBeat</p>
            <p className="text-xs text-white/50">bot</p>
          </div>
        </div>

        {/* Área do chat */}
        <div
          className="flex min-h-[480px] flex-col gap-2.5 px-3 py-4"
          style={{
            backgroundColor: '#0e1621',
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(43,82,120,0.14) 0, transparent 40%), radial-gradient(circle at 85% 70%, rgba(43,82,120,0.1) 0, transparent 45%)',
          }}
        >
          {/* Usuário: /playingnow */}
          <motion.div variants={bubble} custom={0.2} className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#2b5278] px-3.5 py-2">
              <span className="font-mono text-sm text-white">/playingnow</span>
              <TimeStamp time="21:47" read />
            </div>
          </motion.div>

          {/* Bot: typing */}
          <motion.div variants={bubble} custom={0.9} className="flex">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#182533] px-4 py-3">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-white/50"
                  style={{ animationDelay: `${dot * 0.15}s`, animationDuration: '0.9s' }}
                />
              ))}
              <span className="sr-only">{labels.typing}</span>
            </div>
          </motion.div>

          {/* Bot: card tocando agora */}
          <motion.div
            variants={bubble}
            custom={1.7}
            className="max-w-[88%] overflow-hidden rounded-2xl rounded-bl-md bg-[#182533]"
          >
            <div className="px-3.5 pt-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-fb uppercase">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-fb opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-fb" />
                </span>
                {labels.nowPlaying}
              </p>

              <div className="mt-2.5 flex items-center gap-3">
                {/* Capa fake: gradiente + vinil */}
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.45)_29%,transparent_31%,rgba(0,0,0,0.45)_36%,transparent_38%)]" />
                  <div className="size-3 rounded-full bg-black/70 ring-1 ring-white/30" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">Midnight City</p>
                  <p className="truncate text-sm text-white/70">M83</p>
                  <p className="truncate text-xs text-white/45">Hurry Up, We&apos;re Dreaming</p>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-white/55">{labels.scrobbles}</p>
            </div>

            {/* Teclado inline do Telegram */}
            <div className="mt-3 grid gap-px border-t border-white/5 bg-white/5">
              {[labels.btnLyrics, labels.btnMeaning, labels.btnArt].map((label) => (
                <span
                  key={label}
                  className="bg-[#1f2f42] px-3 py-2 text-center text-[13px] font-medium text-[#6db3f2]"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Usuário: tocou em Arte IA */}
          <motion.div variants={bubble} custom={2.5} className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#2b5278] px-3.5 py-2">
              <span className="text-sm text-white">{labels.btnArt}</span>
              <TimeStamp time="21:48" read />
            </div>
          </motion.div>

          {/* Bot: arte gerada */}
          <motion.div
            variants={bubble}
            custom={3.2}
            className="max-w-[88%] overflow-hidden rounded-2xl rounded-bl-md bg-[#182533]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/art/ai-collage.webp"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#182533] via-transparent to-transparent" />
            </div>
            <p className="px-3.5 py-2.5 text-[13px] text-white/85">
              {labels.aiCaption}
              <TimeStamp time="21:48" />
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
