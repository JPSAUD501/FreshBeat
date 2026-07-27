import { Reveal } from './motion/reveal'

interface LegalSection {
  title: string
  text: string
}

/** Estrutura compartilhada das páginas de Privacidade e Termos. */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated?: string
  sections: LegalSection[]
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-28 pb-20 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl tracking-tight uppercase sm:text-5xl">{title}</h1>
        {updated !== undefined && <p className="mt-3 text-sm text-muted-foreground">{updated}</p>}
      </Reveal>
      <div className="mt-12 space-y-10">
        {sections.map((section, index) => (
          <Reveal key={section.title} delay={index * 0.08}>
            <section>
              <h2 className="text-xl font-semibold text-fb">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.text}</p>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
