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
const linkedSuccessMessage = msg({
  key: 'login.success',
  value: '✅ Conta conectada! Seu Last.fm <b>{{lastfmUser}}</b> está vinculado ao FreshBeat.',
})

const LINKED_PAYLOAD_PREFIX = 'linked_'

/**
 * Extrai o username do payload de deep link `linked_<base64url>` que o
 * site emite ao fim do vínculo Last.fm iniciado pelo /login. Payloads
 * de /start aceitam só [A-Za-z0-9_-] e até 64 caracteres.
 */
function decodeLinkedPayload(payload: string): string | undefined {
  if (!payload.startsWith(LINKED_PAYLOAD_PREFIX)) return undefined
  const encoded = payload.slice(LINKED_PAYLOAD_PREFIX.length)
  if (!/^[A-Za-z0-9_-]{1,24}$/.test(encoded)) return undefined
  const username = Buffer.from(encoded, 'base64url').toString('utf8')
  // Usernames do Last.fm: até 15 caracteres alfanuméricos (e _ -).
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,14}$/.test(username)) return undefined
  return username
}

export interface StartCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
}

export function createStartCommand(deps: StartCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('start', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const { isNew, user } = await deps.getOrCreateUser.execute(from.id)

    // Retorno do vínculo Last.fm iniciado pelo /login: o site redireciona
    // para cá (deep link) e o bot confirma o vínculo no próprio chat.
    // Só confirma se o banco tem esse vínculo — o payload pode ser velho.
    const payload = typeof ctx.match === 'string' ? ctx.match : ''
    const linkedUsername = decodeLinkedPayload(payload)
    if (
      linkedUsername !== undefined &&
      user.lastfmUsername?.toLowerCase() === linkedUsername.toLowerCase()
    ) {
      await ctx.reply(ctx.t(linkedSuccessMessage, { lastfmUser: user.lastfmUsername }), {
        parse_mode: 'HTML',
      })
      return
    }

    const text = ctx.t(isNew ? welcomeMessage : welcomeBackMessage, { name: from.first_name })
    await ctx.reply(text, { parse_mode: 'HTML' })
  })

  return {
    name: 'start',
    description: msg({ key: 'cmd.start.description', value: 'Boas-vindas ao FreshBeat' }),
    composer,
  }
}
