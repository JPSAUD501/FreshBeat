import { Handlers } from '$fresh/server.ts'
import { botConfig, handle } from '../../../bot/bot.ts'
import { config } from '../../../config.ts'
import { TelegramServices } from '../../../services/telegram/telegram.service.ts'

const telegramServices = new TelegramServices()

export const handler: Handlers = {
  POST: async (req) => {
    try {
      botConfig.setDomain(new URL(req.url).hostname)
      return await handle(req)
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
      const hostname = new URL(req.url).hostname
      const webhookUrl = `https://${hostname}/api/telegram/webhook`
      const response = await telegramServices.setWebhook({
        webhook_url: webhookUrl,
      })
      return Response.json(response, { status: 200 })
    } catch (err) {
      console.error(err)
      return Response.json(err, { status: 500 })
    }
  },
}
