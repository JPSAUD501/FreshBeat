import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'

const helpMessage = msg({
  key: 'help.text',
  value:
    '📖 <b>O que eu sei fazer:</b>\n\n' +
    '/playingnow — o que você está ouvindo agora\n' +
    '/lyrics — letra da música que está tocando\n' +
    '/history — suas últimas faixas\n' +
    '/brief — resumo do seu perfil musical\n' +
    '/login — conectar sua conta do Last.fm\n' +
    '/forgetme — desvincular e apagar seus dados\n' +
    '/help — esta mensagem',
})

export function createHelpCommand(): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('help', async (ctx) => {
    await ctx.reply(ctx.t(helpMessage), { parse_mode: 'HTML' })
  })

  return {
    name: 'help',
    description: msg({ key: 'cmd.help.description', value: 'Ver tudo que eu sei fazer' }),
    composer,
  }
}
