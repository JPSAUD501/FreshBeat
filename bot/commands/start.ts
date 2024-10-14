import { Context } from 'grammy'
import { registerCommand } from '../index.ts'
import { lang } from '../../translations/base.ts'

registerCommand({
  name: 'start',
  description: (langCode) => lang(langCode, { key: 'tf_start_description', value: 'Bem vindo ao FreshBeat!' }),
  execute: async (ctx: Context) => {
    const reply = await ctx.reply('🎉')
    await new Promise((resolve) => setTimeout(resolve, 3000))
    if (ctx.chat === undefined) return
    await ctx.api.editMessageText(ctx.chat.id, reply.message_id, lang(ctx.message?.from.language_code ?? 'pt-BR', { key: 'tf_start_message', value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }))
  },
})
