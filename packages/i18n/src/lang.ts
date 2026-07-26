import { enUS } from './locales/en-US.js'
import { esES } from './locales/es-ES.js'
import { jaJP } from './locales/ja-JP.js'
import { ptBR, type MessageKey } from './locales/pt-BR.js'
import { DEFAULT_LOCALE, type Locale, type MessageDescriptor } from './types.js'

// Partial<> porque a chave do descritor pode ser desconhecida em runtime
// (ex.: mensagem nova ainda não sincronizada) — daí a cadeia de fallback.
const catalogs: Record<Locale, Partial<Record<MessageKey, string>>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'ja-JP': jaJP,
  'es-ES': esES,
}

export type Vars = Record<string, string | number>

function interpolate(template: string, vars?: Vars): string {
  if (vars === undefined) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const value = vars[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Resolve uma mensagem no idioma pedido, com cadeia de fallback:
 * locale solicitado → pt-BR (base) → texto padrão inline do descritor.
 */
export function lang(locale: Locale, descriptor: MessageDescriptor, vars?: Vars): string {
  const key = descriptor.key as MessageKey
  const template = catalogs[locale][key] ?? catalogs[DEFAULT_LOCALE][key] ?? descriptor.value
  return interpolate(template, vars)
}

/**
 * Extrai placeholders {{var}} de um template — usado nos testes de
 * paridade para garantir que todas as traduções usam as mesmas variáveis.
 */
export function extractVars(template: string): string[] {
  return [...template.matchAll(/\{\{(\w+)\}\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
}

/** Catálogo de um idioma (para sync com Crowdin e testes). */
export function getCatalog(locale: Locale): Record<string, string> {
  return catalogs[locale]
}
