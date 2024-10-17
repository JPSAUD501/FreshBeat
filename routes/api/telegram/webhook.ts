import { Handlers } from '$fresh/server.ts'
import { TelegramBotService } from '../../../bot/bot.service.ts'
import { config } from '../../../config.ts'

if (config.POLLING_MODE) {
  new TelegramBotService({ domain: 'localhost' }).start()
}

export const handler: Handlers = {
  POST: async (req) => {
    try {
      const url = new URL(req.url)
      return await new TelegramBotService({ domain: url.hostname }).handle(req)
    } catch (err) {
      console.error(err)
      return Response.json(err, { status: 500 })
    }
  },
  GET: async (req) => {
    try {
      if (config.POLLING_MODE) {
        return Response.json({ reason: 'Bot is running in polling mode' }, { status: 412 })
      }
      const url = new URL(req.url)
      const webhookUrl = `https://${url.hostname}/api/telegram/webhook`
      const response = await new TelegramBotService({ domain: url.hostname }).setWebhook({
        webhook_path: webhookUrl,
      })
      return Response.json(response, { status: 200 })
    } catch (err) {
      console.error(err)
      return Response.json(err, { status: 500 })
    }
  },
}
