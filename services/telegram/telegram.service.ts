import { bot } from '../../bot/bot.ts'
import type { SetWebhookRequesDto } from './dto/set.dto.ts'

export class TelegramServices {
  async setWebhook(props: SetWebhookRequesDto): Promise<{
    success: boolean
    old_webhook_url: string | null
    new_webhook_url: string | null
  }> {
    const webhookInfo = await bot.api.getWebhookInfo()
    if (webhookInfo.url === props.webhook_url) {
      return {
        success: true,
        old_webhook_url: webhookInfo.url,
        new_webhook_url: null,
      }
    }
    await bot.api.setWebhook(props.webhook_url)
    const newWebhookInfo = await bot.api.getWebhookInfo()
    if (newWebhookInfo.url !== props.webhook_url) {
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
