import type { Context } from 'grammy'
import type { Locale, MessageDescriptor, Vars } from '@freshbeat/i18n'
import type { Logger } from '@freshbeat/logging'

/**
 * Contexto do FreshBeat. `requestId`/`log` são preenchidos pelo middleware
 * de observabilidade (primeiro da cadeia) e `locale`/`t` pelo middleware
 * de locale — qualquer handler pode assumir que eles existem.
 */
export interface FreshBeatContext extends Context {
  /** UUID da interação — aparece em todos os logs do request e no erro ao usuário. */
  requestId: string
  /** Logger com os bindings do request (requestId, usuário, interação). */
  log: Logger
  locale: Locale
  t: (descriptor: MessageDescriptor, vars?: Vars) => string
}
