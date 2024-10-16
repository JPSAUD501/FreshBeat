import { Bot, webhookCallback } from 'grammy'
import { config } from '../config.ts'
import { setupCommands } from './index.ts'
import * as startCommand from './commands/start/start.ts'
import * as helpCommand from './commands/help/help.ts'

startCommand.register()
helpCommand.register()

export const bot = new Bot(config.BOT_TOKEN)

setupCommands(bot)

if (config.POLLING_MODE) {
  console.log('Starting bot in polling mode')
  bot.start()
} else {
  console.log('Bot configured for webhook mode')
}

export const handle = webhookCallback(bot, 'std/http')

export async function startPolling() {
  if (config.POLLING_MODE) {
    await bot.api.deleteWebhook()
    console.log('Webhook deleted. Starting bot in polling mode')
    await bot.start()
    return
  }
  console.warn(`Polling mode is not enabled. Set POLLING_MODE="true" to use polling.`)
}
