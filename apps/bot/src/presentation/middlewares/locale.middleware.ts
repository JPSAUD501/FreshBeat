import { lang, msg, normalizeLocale } from '@freshbeat/i18n'
import type { MiddlewareFn } from 'grammy'
import type { FreshBeatContext } from '../context.js'

/**
 * Resolve o idioma do usuário (pelo language_code do Telegram;
 * a preferência salva no banco é aplicada pelos use cases quando
 * o usuário já existe) e expõe `ctx.t` para traduzir mensagens.
 */
export function createLocaleMiddleware(): MiddlewareFn<FreshBeatContext> {
  return async (ctx, next) => {
    ctx.locale = normalizeLocale(ctx.from?.language_code)
    ctx.t = (descriptor, vars) => lang(ctx.locale, descriptor, vars)
    await next()
  }
}

export const loadingMessage = msg({ key: 'common.loading', value: '⏳ Carregando…' })
