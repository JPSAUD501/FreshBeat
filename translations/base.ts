import { baseLang } from './languages/auto/Base-FB-ptBR.ts'
import type { BaseLang } from './languages/auto/Type-FB-ptBR.ts'
import { en } from './languages/en.ts'

export type Language = typeof baseLang
export type Parameters = keyof typeof baseLang

export function lang(langCode: string | undefined, { key, value }: BaseLang, variables?: Record<string, string | number>): string {
  const lang: Language = langCode === 'en' ? { ...baseLang, ...en } : baseLang
  const keyValue: string | undefined = lang[key]
  if (keyValue === undefined) return value
  if (variables === undefined) return keyValue
  return valueVariablesParser(keyValue, variables)
}

function valueVariablesParser(value: string, variables: Record<string, string | number>): string {
  let newValue = value
  for (const key in variables) {
    newValue = newValue.replaceAll(`{{${key}}}`, String(variables[key]))
  }
  return newValue
}
