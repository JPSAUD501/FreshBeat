import type { Context } from 'grammy'
import type { Locale, MessageDescriptor, Vars } from '@freshbeat/i18n'

/**
 * Contexto do FreshBeat. O `locale` e o helper `t` são preenchidos
 * pelo middleware de sessão no início de cada update — qualquer
 * handler pode assumir que eles existem.
 */
export interface FreshBeatContext extends Context {
  locale: Locale
  t: (descriptor: MessageDescriptor, vars?: Vars) => string
}
