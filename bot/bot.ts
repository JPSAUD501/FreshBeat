import { Bot, webhookCallback } from 'grammy'
import { config } from '../config.ts'
import { setupCommands } from './index.ts'

import './commands/start.ts'
import './commands/help.ts'

const bot = new Bot(config.BOT_TOKEN)

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
