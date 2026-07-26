import { msg } from '@freshbeat/i18n'
import { Composer, InlineKeyboard } from 'grammy'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import type { StartLoginUseCase } from '../../application/use-cases/login.js'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'

const alreadyLinkedMessage = msg({
  key: 'login.already_linked',
  value:
    '✅ Sua conta do Last.fm já está conectada como <b>{{lastfmUser}}</b>.\n\nSe quiser trocar de conta, use /forgetme primeiro.',
})
const loginPromptMessage = msg({
  key: 'login.prompt',
  value:
    '🔗 Vamos conectar sua conta do Last.fm!\n\nToque no botão abaixo para autorizar. O link expira em {{minutes}} minutos.',
})
const loginButtonMessage = msg({ key: 'login.button', value: 'Conectar Last.fm' })

export interface LoginCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  startLogin: StartLoginUseCase
}

export function createLoginCommand(deps: LoginCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('login', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const { user } = await deps.getOrCreateUser.execute(from.id)
    const result = await deps.startLogin.execute(user)

    if (result.status === 'already_linked') {
      await ctx.reply(ctx.t(alreadyLinkedMessage, { lastfmUser: result.lastfmUsername }), {
        parse_mode: 'HTML',
      })
      return
    }

    const keyboard = new InlineKeyboard().url(ctx.t(loginButtonMessage), result.url)
    await ctx.reply(ctx.t(loginPromptMessage, { minutes: result.expiresInMinutes }), {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })
  })

  return {
    name: 'login',
    description: msg({ key: 'cmd.login.description', value: 'Conectar sua conta do Last.fm' }),
    composer,
  }
}
