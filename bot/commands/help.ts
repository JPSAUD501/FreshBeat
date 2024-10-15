import { Context } from 'grammy'
import { getCommandList, registerCommand } from '../index.ts'
import { lang } from '../../localization/base.ts'

registerCommand({
  name: 'help',
  description: (langCode) => lang(langCode, { key: 'tf_help_description', value: 'Mostra todos os comandos disponíveis' }),
  execute: (ctx: Context) => {
    const langCode = ctx.message?.from.language_code
    const commandList = getCommandList()
    const textArray: string[] = []
    textArray.push(lang(langCode, { key: 'tf_help_message', value: 'Aqui estão todos os comandos disponíveis:' }))
    for (const command of commandList) {
      textArray.push(`/${command.command} - ${command.description(langCode)}`)
    }
    ctx.reply(textArray.join('\n'))
  },
})
