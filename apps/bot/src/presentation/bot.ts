import { SUPPORTED_LOCALES, lang, type Locale } from '@freshbeat/i18n'
import { Bot, type Composer } from 'grammy'
import type { LanguageCode } from 'grammy/types'
import type { FreshBeatContext } from './context.js'
import type { CommandModule } from './commands/command-module.js'
import { createErrorHandler, type ErrorHandlerDeps } from './error-handler.js'
import { createLocaleMiddleware } from './middlewares/locale.middleware.js'
import { createObservabilityMiddleware } from './middlewares/observability.middleware.js'
import { createRateLimitMiddleware } from './middlewares/rate-limit.middleware.js'
import type { RateLimiter } from '@freshbeat/cache'
import type { Logger } from '@freshbeat/logging'
import type { UserRepository } from '../domain/ports/user-repository.js'

export interface BotDeps extends ErrorHandlerDeps {
  token: string
  logger: Logger
  rateLimiter: RateLimiter
  userRepository: UserRepository
  commands: CommandModule[]
  /** Composers sem comando associado (callbacks, listeners). */
  listeners?: Composer<FreshBeatContext>[]
}

/**
 * Monta o bot: middlewares globais → comandos → handler único de erros.
 * Uma instância por processo (criada no composition root).
 */
export function createBot(deps: BotDeps): Bot<FreshBeatContext> {
  const bot = new Bot<FreshBeatContext>(deps.token)

  bot.use(createObservabilityMiddleware(deps.logger))
  bot.use(createLocaleMiddleware(deps.userRepository))
  bot.use(createRateLimitMiddleware(deps.rateLimiter))

  for (const command of deps.commands) {
    bot.use(command.composer)
  }
  for (const listener of deps.listeners ?? []) {
    bot.use(listener)
  }

  bot.catch(createErrorHandler(deps))

  return bot
}

/**
 * Registra os comandos no Telegram com descrições traduzidas
 * por idioma. Os NOMES ficam sempre em inglês.
 *
 * Falha aqui (ex.: 429 de rate limit) não pode derrubar o boot —
 * sem o registro o bot continua respondendo normalmente.
 */
export async function registerBotCommands(
  bot: Bot<FreshBeatContext>,
  commands: CommandModule[],
  logger: Logger,
): Promise<void> {
  try {
    // Descrição padrão (pt-BR) para clientes sem idioma definido
    await bot.api.setMyCommands(
      commands.map((command) => ({
        command: command.name,
        description: lang('pt-BR', command.description),
      })),
    )

    for (const locale of SUPPORTED_LOCALES) {
      await bot.api.setMyCommands(
        commands.map((command) => ({
          command: command.name,
          description: lang(locale, command.description),
        })),
        { language_code: localeToTelegramLanguageCode(locale) },
      )
    }

    logger.info({ commands: commands.map((c) => c.name) }, 'commands registered')
  } catch (error) {
    logger.warn({ err: error }, 'falha ao registrar comandos (o bot segue funcionando)')
  }
}

/** Bot API aceita apenas códigos ISO 639-1 de duas letras. */
function localeToTelegramLanguageCode(locale: Locale): LanguageCode {
  const map: Record<Locale, LanguageCode> = {
    'pt-BR': 'pt',
    'en-US': 'en',
    'ja-JP': 'ja',
    'es-ES': 'es',
  }
  return map[locale]
}
