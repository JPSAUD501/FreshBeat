import { Bot, webhookCallback } from 'grammy'
import { config } from '../../../config.ts'
import { StartComposer } from './functions/start/start.composer.ts'
import type { TelegramBotCommand, TelegramBotConfig } from './types.ts'
import type { SetWebhookRequesDto, SetWebhookResponseDto } from './dto/set.dto.ts'
import { LastFmService } from '../../lastfm/lastfm.service.ts'
import { DBService } from '../../db/db.service.ts'
import { UsersService } from '../../users/users.service.ts'
import { ErrorsService } from '../../errors/errors.service.ts'
import { ForgetMeComposer } from './functions/forgetme/forgetme.composer.ts'
import { HelpComposer } from './functions/help/help.composer.ts'
import { KeyvalueService } from '../../keyvalue/keyvalue.service.ts'

export class TelegramBotService {
  private readonly bot = new Bot(config.BOT_TOKEN)
  private readonly composers
  private readonly commands: TelegramBotCommand[] = []
  private config: TelegramBotConfig
  private readonly acceptedLanguages = ['en', 'pt']
  private readonly lastfmService = new LastFmService({ apiKey: config.LASTFM_API_KEY, apiSecret: config.LASTFM_API_SECRET })

  constructor(config: TelegramBotConfig) {
    this.config = config
    const dbService = new DBService()
    const usersService = new UsersService(dbService)
    const errorsService = new ErrorsService(dbService)
    const keyvalueService = new KeyvalueService(dbService)
    this.composers = [
      new StartComposer(
        this.lastfmService,
        usersService,
        errorsService,
        keyvalueService,
      ),
      new ForgetMeComposer(
        usersService,
        errorsService,
      ),
      new HelpComposer(
        errorsService,
      ),
    ]
    this.useComposers()
  }

  private useComposers() {
    for (const composer of this.composers) {
      this.bot.use(composer.get())
      this.commands.push(...composer.commands())
    }
    this.bot.api.setMyCommands(this.commands.map((cmd) => ({ command: cmd.name, description: cmd.description(undefined) })))
    for (const lang of this.acceptedLanguages) {
      this.bot.api.setMyCommands(this.commands.map((cmd) => ({ command: cmd.name, description: cmd.description(lang) })), { language_code: lang as unknown as undefined })
    }
  }

  async getBot() {
    if (!this.bot.isInited()) {
      await this.bot.init()
    }
    return this.bot.botInfo
  }

  getConfig(): TelegramBotConfig {
    return this.config
  }

  setConfig(config: TelegramBotConfig) {
    this.config = config
  }

  async handle(req: Request): Promise<Response> {
    return await webhookCallback(this.bot, 'std/http')(req)
  }

  async start() {
    console.info('Starting bot in polling mode!')
    await this.bot.api.deleteWebhook()
    void this.bot.start({
      drop_pending_updates: true,
    })
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
