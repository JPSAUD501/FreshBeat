import { baseLang } from './languages/auto/base-ptBR.ts'
import type { BaseLang } from './languages/auto/type-ptBR.ts'
import { en } from './languages/en.ts'

export type Language = typeof baseLang
export type Parameters = keyof typeof baseLang

export function lang(langCode: string | undefined, { key, value }: BaseLang, variables?: Record<string, string | number>): string {
  const lang: Language = langCode === 'en' ? { ...baseLang, ...en } : baseLang
  const keyValue: string | undefined = (lang as Record<string, string | undefined>)[key]
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
