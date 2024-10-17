import { Context } from 'grammy'
import { lang } from '../../../localization/base.ts'
import { getCommandList, registerCommand } from '../../index.ts'
import { mfHelp } from './help-mf.ts'

export const register = () => (
  registerCommand({
    name: 'help',
    description: (langCode: string | undefined) => lang(langCode, { key: 'help_command_description', value: 'Mostra todos os comandos disponíveis' }),
    execute: (ctx: Context) => {
      const langCode = ctx.message?.from.language_code
      const commandList = getCommandList().map((cmd) => ({ command: cmd.command, description: cmd.description(langCode) }))
      const mfResponse = mfHelp(langCode, { command_list: commandList })
      ctx.reply(mfResponse)
    },
  })
)
