import { Headphones, Link2, MessageCircle } from 'lucide-react'
import { Reveal } from '../motion/reveal'

const STEP_ICONS = [Link2, Headphones, MessageCircle]

interface Step {
  title: string
  text: string
}

interface HowItWorksProps {
  title: string
  steps: Step[]
}

/** "Como funciona" — 3 passos editoriais numerados, com ícone e hover. */
export function HowItWorks({ title, steps }: HowItWorksProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <Reveal>
        <h2 className="font-display text-4xl tracking-tight uppercase sm:text-5xl">{title}</h2>
      </Reveal>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index % STEP_ICONS.length]
          return (
            <Reveal key={step.title} delay={index * 0.15} className="bg-card">
              <div className="group flex h-full flex-col gap-4 p-8 transition-colors duration-300 hover:bg-secondary/40">
                <div className="flex items-start justify-between">
                  <span className="text-stroke font-display text-7xl leading-none transition-opacity duration-300 group-hover:opacity-80">
                    0{index + 1}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-fb/10 text-fb transition-colors duration-300 group-hover:bg-fb group-hover:text-black">
                    <Icon className="size-5" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
