import { lang } from '../../../localization/base.ts'
import type { MsgFabricOutput } from '../../types.ts'

export function mfHelp(langCode: string | undefined, props: {
  command_list: Array<{
    command: string
    description: string
  }>
}): MsgFabricOutput {
  const textArray: string[] = []
  textArray.push(lang(langCode, { key: 'mf_help_message', value: 'Aqui estão todos os comandos disponíveis:' }))
  for (const command of props.command_list) {
    textArray.push(`/${command}`)
  }
  return {
    message: textArray.join('\n'),
  }
}
