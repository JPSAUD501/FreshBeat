import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { lang } from '../../../localization/base.ts'
import { mfStart } from './start-mf.ts'
import { registerCommand } from '../../index.ts'
import { botDomain } from '../../bot.ts'

export const register = () => (
  registerCommand({
    name: 'start',
    description: (langCode: string | undefined) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }),
    execute: async (ctx: Context) => {
      const langCode = ctx.message?.from.language_code
      const mfResponse = mfStart(langCode)
      const keyboard = new Keyboard().webApp('Logar', 'https://www.last.fm/api/auth/?api_key=4f52c86c1bc1b5870c1e35227dddcc03')
      const inlineKeyboard = new InlineKeyboard().webApp('Logar', `https://www.last.fm/api/auth/?api_key=4f52c86c1bc1b5870c1e35227dddcc03`)
      await ctx.reply(mfResponse + `${botDomain}`, {
        reply_markup: {
          keyboard: keyboard.keyboard,
          inline_keyboard: inlineKeyboard.inline_keyboard
        },
      })
    },
  })
)
