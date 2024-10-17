import { Context, InlineKeyboard } from 'grammy'
import { lang } from '../../../localization/base.ts'
import { mfStart } from './start-mf.ts'
import { config } from '../../../config.ts'
import { registerCommand } from '../../index.ts'
import { botConfig } from '../../bot.ts'

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
      const inlineKeyboard = new InlineKeyboard().webApp('Teste!', `${botConfig.getDomain()}/lastfm/create-account`)
      await ctx.reply(`${config.APP_DOMAIN}`)
      await ctx.api.editMessageText(ctx.chat.id, reply.message_id, mfResponse.message, {
        reply_markup: {
          inline_keyboard: inlineKeyboard.inline_keyboard,
        },
      })
    },
  })
)
