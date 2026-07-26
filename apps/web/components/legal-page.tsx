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
    <div className="py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      {updated !== undefined && <p className="mt-2 text-sm text-muted">{updated}</p>}
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-muted">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
