import { createContainer } from './composition/container.js'
import { registerBotCommands } from './presentation/bot.js'

/**
 * Bootstrap do bot em modo POLLING.
 * Sobe config (fail-fast), registra comandos traduzidos e começa
 * a consumir updates. Shutdown gracioso em SIGINT/SIGTERM.
 */
async function main(): Promise<void> {
  const container = createContainer()
  const { bot, logger, commands, cache } = container

  await registerBotCommands(bot, commands, logger, cache)

  // Garante que não há webhook configurado atrapalhando o polling
  await bot.api.deleteWebhook()

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutting down')
    void bot.stop()
    void container.close().finally(() => process.exit(0))
  }
  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))

  logger.info('starting bot in polling mode')
  await bot.start({
    drop_pending_updates: true,
    onStart: (botInfo) => {
      logger.info({ username: botInfo.username }, 'bot is running')
    },
  })
}

main().catch((error: unknown) => {
  // Falha de bootstrap (ex.: config inválida) — loga e morre com código != 0
  console.error(error)
  process.exit(1)
})
