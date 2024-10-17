import { Context, InlineKeyboard } from 'grammy'
import { lang } from '../../../localization/base.ts'
import { mfStart } from './start-mf.ts'
import { config } from '../../../config.ts'
import { registerCommand } from '../../index.ts'

export const register = () => (
  registerCommand({
    name: 'start',
    description: (langCode: string | undefined) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }),
    execute: async (ctx: Context) => {
      const langCode = ctx.message?.from.language_code
      const reply = await ctx.reply('🎉')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      if (ctx.chat === undefined) return
      const mfResponse = mfStart(langCode)
      const inlineKeyboard = new InlineKeyboard().webApp('Logar', `http://www.last.fm/api/auth/?api_key=4f52c86c1bc1b5870c1e35227dddcc03`)
      await ctx.reply(`${config.APP_DOMAIN}`)
      await ctx.api.editMessageText(ctx.chat.id, reply.message_id, mfResponse, {
        reply_markup: {
          inline_keyboard: inlineKeyboard.inline_keyboard,
        },
      })
    },
  })
)
