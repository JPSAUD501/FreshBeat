import type { MessageDescriptor } from '@freshbeat/i18n'
import type { Composer } from 'grammy'
import type { FreshBeatContext } from '../context.js'

/**
 * Módulo de comando do bot. `name` é SEMPRE em inglês (nomes de
 * comando não se traduzem); `description` é traduzida por idioma
 * no setMyCommands.
 */
export interface CommandModule {
  readonly name: string
  readonly description: MessageDescriptor
  readonly composer: Composer<FreshBeatContext>
}
