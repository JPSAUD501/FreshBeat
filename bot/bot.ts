import { Bot, webhookCallback } from 'grammy'
import { config } from '../config.ts'
import { setupCommands } from './index.ts'
import * as startCommand from './functions/start/start.command.ts'
import * as helpCommand from './functions/help/help.command.ts'

export let botDomain = config.APP_DOMAIN

startCommand.register()
helpCommand.register()

export const bot = new Bot(config.BOT_TOKEN)

await setupCommands(bot)

if (config.POLLING_MODE) {
  console.log('Starting bot in polling mode')
  bot.start({
    drop_pending_updates: true,
  })
}

export const handle = async (req: Request, url: URL): Promise<Response> => {
  botDomain = url.hostname
  return await webhookCallback(bot, 'std/http')(req)
}

export async function startPolling() {
  if (config.POLLING_MODE) {
    await bot.api.deleteWebhook()
    console.log('Webhook deleted. Starting bot in polling mode')
    await bot.start()
    return
  }
  console.warn(`Polling mode is not enabled. Set POLLING_MODE="true" to use polling.`)
}
