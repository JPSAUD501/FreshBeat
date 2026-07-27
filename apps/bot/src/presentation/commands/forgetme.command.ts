import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import type { DeleteAccountUseCase } from '../../application/use-cases/login.js'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'

const doneMessage = msg({
  key: 'forgetme.done',
  value:
    '🧹 Pronto! Desvinculei sua conta do Last.fm e apaguei seus dados.\n\nSe quiser voltar, é só usar /login.',
})

export interface ForgetMeCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  deleteAccount: DeleteAccountUseCase
}

/**
 * /forgetme — exclusão real: apaga o registro do usuário (vínculo
 * Last.fm, preferências de idioma, tudo) do banco.
 */
export function createForgetMeCommand(deps: ForgetMeCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('forgetme', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const { user } = await deps.getOrCreateUser.execute(from.id)
    await deps.deleteAccount.execute(user)
    await ctx.reply(ctx.t(doneMessage))
  })

  return {
    name: 'forgetme',
    description: msg({ key: 'cmd.forgetme.description', value: 'Apagar seus dados' }),
    composer,
  }
}
