import { Context } from 'grammy'
import { lang } from '../../../localization/base.ts'
import { mfStart } from './start-mf.ts'

export const register = () => ({
  name: 'start',
  description: (langCode: string) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }),
  execute: async (ctx: Context) => {
    const langCode = ctx.message?.from.language_code
    const reply = await ctx.reply('🎉')
    await new Promise((resolve) => setTimeout(resolve, 3000))
    if (ctx.chat === undefined) return
    const mfResponse = mfStart(langCode)
    await ctx.api.editMessageText(ctx.chat.id, reply.message_id, mfResponse.message)
  },
})
