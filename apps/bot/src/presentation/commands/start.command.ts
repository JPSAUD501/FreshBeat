import { msg } from '@freshbeat/i18n'
import { Composer } from 'grammy'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'

const welcomeMessage = msg({
  key: 'start.welcome',
  value:
    '🎧 Olá, {{name}}! Eu sou o <b>FreshBeat</b>, seu companheiro de música.\n\nEu mostro o que você está ouvindo no Last.fm, busco letras e explico o significado das suas músicas favoritas.\n\nUse /help para ver tudo que eu sei fazer.',
})
const welcomeBackMessage = msg({
  key: 'start.welcome_back',
  value: '🎧 Que bom te ver de novo, {{name}}! Use /help para ver os comandos.',
})

export interface StartCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
}

export function createStartCommand(deps: StartCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('start', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const { isNew } = await deps.getOrCreateUser.execute(from.id)
    const text = ctx.t(isNew ? welcomeMessage : welcomeBackMessage, { name: from.first_name })
    await ctx.reply(text, { parse_mode: 'HTML' })
  })

  return {
    name: 'start',
    description: msg({ key: 'cmd.start.description', value: 'Boas-vindas ao FreshBeat' }),
    composer,
  }
}
