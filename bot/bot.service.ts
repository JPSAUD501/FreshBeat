import { Bot, webhookCallback } from 'grammy'
import { config } from '../config.ts'
import { StartComposer } from './functions/start/start.service.ts'
import type { BotCommand, BotConfig } from './types.ts'
import type { SetWebhookRequesDto, SetWebhookResponseDto } from './dto/set.dto.ts'
import { LastFmService } from '../services/lastfm/lastfm.service.ts'

export class TelegramBotService {
  private readonly bot = new Bot(config.BOT_TOKEN)
  private readonly composers
  private readonly commands: BotCommand[] = []
  private config: BotConfig
  private readonly acceptedLanguages = ['en', 'pt']
  private readonly lastfmService = new LastFmService({ apiKey: config.LASTFM_API_KEY, apiSecret: config.LASTFM_API_SECRET })

  constructor(config: BotConfig) {
    this.config = config
    this.composers = [
      new StartComposer(
        this.getConfig(),
        this.lastfmService
      ),
    ]
    this.useComposers()
  }

  private useComposers() {
    for (const composer of this.composers) {
      this.bot.use(composer.get())
      this.commands.push(...composer.commands())
    }
    this.bot.api.setMyCommands(this.commands.map((cmd) => ({ command: cmd.name, description: cmd.description('en') })))
    for (const lang of this.acceptedLanguages) {
      this.bot.api.setMyCommands(this.commands.map((cmd) => ({ command: cmd.name, description: cmd.description(lang) })))
    }
  }

  async getBot() {
    await this.bot.init()
    return this.bot.botInfo
  }

  getCommands() {
    return this.bot.api.getMyCommands()
  }

  getConfig(): BotConfig {
    return this.config
  }

  setConfig(config: BotConfig) {
    this.config = config
  }

  async handle(req: Request): Promise<Response> {
    return await webhookCallback(this.bot, 'std/http')(req)
  }

  async start() {
    console.info('Starting bot in polling mode!')
    await this.bot.api.deleteWebhook()
    void this.bot.start()
  }

  async setWebhook(props: SetWebhookRequesDto): Promise<SetWebhookResponseDto> {
    const webhookInfo = await this.bot.api.getWebhookInfo()
    const webhookUrl = `${this.config.domain}${props.webhook_path}`
    if (webhookInfo.url === webhookUrl) {
      return {
        success: true,
        old_webhook_url: webhookInfo.url ?? null,
        new_webhook_url: null,
      }
    }
    await this.bot.api.setWebhook(webhookUrl)
    const newWebhookInfo = await this.bot.api.getWebhookInfo()
    if (newWebhookInfo.url !== webhookUrl) {
      return {
        success: false,
        old_webhook_url: webhookInfo.url ?? null,
        new_webhook_url: newWebhookInfo.url ?? null,
      }
    }
    return {
      success: true,
      old_webhook_url: webhookInfo.url ?? null,
      new_webhook_url: newWebhookInfo.url,
    }
  }
}
