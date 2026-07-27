import Image from 'next/image'
import { Parallax } from '../motion/parallax'
import { Reveal } from '../motion/reveal'

interface Feature {
  eyebrow: string
  title: string
  text: string
  /** Arte em /public/art (opcional — sem imagem o bloco vira tipografia pura) */
  image?: { src: string; alt: string }
}

interface FeaturesProps {
  features: Feature[]
}

/** Features editoriais em blocos alternados com reveal + parallax na arte. */
export function Features({ features }: FeaturesProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 sm:px-6">
      {features.map((feature, index) => {
        const flip = index % 2 === 1
        return (
          <div key={feature.eyebrow} className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14">
            <Reveal className={flip ? 'sm:order-2' : undefined}>
              <span className="flex items-center gap-3 text-sm font-semibold tracking-[0.25em] text-fb uppercase">
                <span aria-hidden className="h-px w-8 bg-fb" />
                {feature.eyebrow}
              </span>
              <h3 className="mt-3 font-display text-4xl leading-tight tracking-tight uppercase sm:text-5xl">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">{feature.text}</p>
            </Reveal>

            {feature.image !== undefined && (
              <Parallax offset={36} className={flip ? 'sm:order-1' : undefined}>
                <div className="group glow-fb relative aspect-[4/3] overflow-hidden rounded-2xl border border-fb/20">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"
                  />
                </div>
              </Parallax>
            )}
          </div>
        )
      })}
    </div>
  )
}
