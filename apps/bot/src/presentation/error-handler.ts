import { msg, normalizeLocale, lang, type Locale } from '@freshbeat/i18n'
import type { Logger } from '@freshbeat/logging'
import type { BotError } from 'grammy'
import { AppError } from '../domain/errors/app-error.js'
import type { ErrorLogRepository } from '../domain/ports/error-log-repository.js'
import type { FreshBeatContext } from './context.js'

const errorWithCodeMessage = msg({
  key: 'common.error_with_code',
  value:
    '😕 Algo deu errado por aqui. Nossa equipe já foi avisada!\n\nCódigo do erro: <code>/support_error_{{errorId}}</code>',
})

export interface ErrorHandlerDeps {
  logger: Logger
  errorLogRepository: ErrorLogRepository
}

/**
 * ÚNICO ponto de tratamento de erros do bot (registrado via bot.catch).
 *
 * - AppError (erros "de negócio") → responde a mensagem traduzida da i18nKey.
 * - Erros inesperados → loga, persiste e responde /support_error_{id}.
 *
 * Acaba com o método error() copiado em cada composer do projeto antigo.
 */
export function createErrorHandler(deps: ErrorHandlerDeps) {
  return async (botError: BotError<FreshBeatContext>): Promise<void> => {
    const { ctx } = botError
    const error = botError.error
    // O middleware de locale pode não ter rodado se o erro foi muito cedo
    const locale = (ctx.locale as Locale | undefined) ?? normalizeLocale(ctx.from?.language_code)
    const source = `update:${ctx.update.update_id}`

    if (error instanceof AppError) {
      deps.logger.warn({ err: error, source }, 'app error')
      const text = lang(locale, msg({ key: error.i18nKey, value: error.message }), error.vars)
      await ctx.reply(text, { parse_mode: 'HTML' }).catch(() => undefined)
      return
    }

    const err = error instanceof Error ? error : new Error(String(error))
    deps.logger.error({ err, source }, 'unexpected error')

    let errorId = 'unknown'
    try {
      errorId = await deps.errorLogRepository.log({
        telegramUserId: ctx.from?.id ?? null,
        source,
        error: err,
      })
    } catch (logError) {
      deps.logger.error({ err: logError }, 'failed to persist error log')
    }

    await ctx
      .reply(lang(locale, errorWithCodeMessage, { errorId }), { parse_mode: 'HTML' })
      .catch(() => undefined)
  }
}
