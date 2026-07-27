import { msg, normalizeLocale, lang, type Locale } from '@freshbeat/i18n'
import type { Logger } from '@freshbeat/logging'
import type { BotError } from 'grammy'
import { AppError } from '../domain/errors/app-error.js'
import type { FreshBeatContext } from './context.js'

const errorWithRequestIdMessage = msg({
  key: 'common.error_request_id',
  value:
    '😕 Algo deu errado por aqui. Nossa equipe já foi avisada!\n\nSe precisar de ajuda, informe o código: <code>{{requestId}}</code>',
})

export interface ErrorHandlerDeps {
  logger: Logger
}

/**
 * ÚNICO ponto de tratamento de erros do bot (registrado via bot.catch).
 *
 * - AppError (erros "de negócio") → responde a mensagem traduzida da i18nKey.
 * - Erros inesperados → log estruturado com requestId e resposta ao usuário
 *   apenas com esse código — nada de stack/id de banco na conversa.
 */
export function createErrorHandler(deps: ErrorHandlerDeps) {
  return async (botError: BotError<FreshBeatContext>): Promise<void> => {
    const { ctx } = botError
    const error = botError.error
    // O middleware de locale pode não ter rodado se o erro foi muito cedo
    const locale = (ctx.locale as Locale | undefined) ?? normalizeLocale(ctx.from?.language_code)
    // Idem observabilidade — cai para o logger raiz sem requestId
    const log = (ctx.log as Logger | undefined) ?? deps.logger

    if (error instanceof AppError) {
      log.warn({ err: error }, 'app error')
      const text = lang(locale, msg({ key: error.i18nKey, value: error.message }), error.vars)
      await ctx.reply(text, { parse_mode: 'HTML' }).catch(() => undefined)
      return
    }

    const err = error instanceof Error ? error : new Error(String(error))
    log.error({ err }, 'unexpected error')

    // O usuário recebe um prefixo curto do requestId — suficiente para
    // localizar o log completo (que tem o UUID inteiro).
    const publicCode = `req_${(ctx.requestId as string | undefined)?.slice(0, 8) ?? 'unknown'}`
    await ctx
      .reply(lang(locale, errorWithRequestIdMessage, { requestId: publicCode }), {
        parse_mode: 'HTML',
      })
      .catch(() => undefined)
  }
}
