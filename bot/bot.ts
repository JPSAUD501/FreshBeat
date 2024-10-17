import { Bot, webhookCallback } from 'grammy'
import { config } from '../config.ts'
import { setupCommands } from './index.ts'
import * as startCommand from './functions/start/start.command.ts'
import * as helpCommand from './functions/help/help.command.ts'

export class BotConfigService {
  private domain: string

  constructor() {
    this.domain = config.APP_DOMAIN
  }

  getDomain(): string {
    return this.domain
  }

  setDomain(domain: string): void {
    this.domain = domain
  }
}

export const botConfig = new BotConfigService()

startCommand.register()
helpCommand.register()

export const bot = new Bot(config.BOT_TOKEN)

setupCommands(bot)

if (config.POLLING_MODE) {
  console.log('Starting bot in polling mode')
  bot.start({
    drop_pending_updates: true,
  })
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
