import { Reveal } from '../motion/reveal'

interface Step {
  title: string
  text: string
}

interface HowItWorksProps {
  title: string
  steps: Step[]
}

/** "Como funciona" — 3 passos editoriais numerados. */
export function HowItWorks({ title, steps }: HowItWorksProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <Reveal>
        <h2 className="font-display text-4xl tracking-tight uppercase sm:text-5xl">{title}</h2>
      </Reveal>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.15} className="bg-card">
            <div className="flex h-full flex-col gap-4 p-8">
              <span className="text-stroke font-display text-7xl leading-none">0{index + 1}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
