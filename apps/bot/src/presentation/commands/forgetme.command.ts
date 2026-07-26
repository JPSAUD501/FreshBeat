import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import type { UnlinkLastfmUseCase } from '../../application/use-cases/login.js'
import { LastfmNotLinkedError } from '../../domain/errors/app-error.js'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'

const notLinkedMessage = msg({
  key: 'forgetme.not_linked',
  value: 'Você não tem uma conta do Last.fm conectada.',
})
const doneMessage = msg({
  key: 'forgetme.done',
  value:
    '🧹 Pronto! Desvinculei sua conta do Last.fm e apaguei seus dados.\n\nSe quiser voltar, é só usar /login.',
})

export interface ForgetMeCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  unlinkLastfm: UnlinkLastfmUseCase
}

export function createForgetMeCommand(deps: ForgetMeCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('forgetme', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const { user } = await deps.getOrCreateUser.execute(from.id)
    try {
      await deps.unlinkLastfm.execute(user)
    } catch (error) {
      if (error instanceof LastfmNotLinkedError) {
        await ctx.reply(ctx.t(notLinkedMessage))
        return
      }
      throw error
    }
    await ctx.reply(ctx.t(doneMessage))
  })

  return {
    name: 'forgetme',
    description: msg({ key: 'cmd.forgetme.description', value: 'Desvincular e apagar seus dados' }),
    composer,
  }
}
