import { lang, msg, resolveUserLocale } from '@freshbeat/i18n'
import type { MiddlewareFn } from 'grammy'
import type { UserRepository } from '../../domain/ports/user-repository.js'
import type { FreshBeatContext } from '../context.js'

/**
 * Resolve o idioma do usuário e expõe `ctx.t` para traduzir mensagens.
 *
 * Ordem de precedência:
 * 1. `preferredLocale` salvo no banco (escolha explícita no site) — sobrepõe tudo;
 * 2. `language_code` do Telegram (detectado a cada interação).
 *
 * Também persiste o idioma do Telegram (fire-and-forget) para o site
 * usar como base quando não há preferência explícita.
 */
export function createLocaleMiddleware(
  userRepository: UserRepository,
): MiddlewareFn<FreshBeatContext> {
  return async (ctx, next) => {
    const from = ctx.from
    let preferredLocale: string | null = null

    if (from !== undefined) {
      const user = await userRepository.findByTelegramId(from.id)
      if (user !== null) {
        preferredLocale = user.preferredLocale
        if (
          user.preferredLocale === null &&
          from.language_code !== undefined &&
          user.telegramLocale !== from.language_code
        ) {
          // Persiste sem bloquear a resposta — falha aqui não pode quebrar o comando
          void userRepository.touchTelegramLocale(from.id, from.language_code).catch(() => null)
        }
      }
    }

    ctx.locale = resolveUserLocale(preferredLocale, from?.language_code)
    ctx.t = (descriptor, vars) => lang(ctx.locale, descriptor, vars)
    await next()
  }
}

export const loadingMessage = msg({ key: 'common.loading', value: '⏳ Carregando…' })
