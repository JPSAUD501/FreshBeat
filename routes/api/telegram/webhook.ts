import { Handlers } from '$fresh/server.ts'
import { handle } from '../../../bot/bot.ts'
import { config } from '../../../config.ts'

export const handler: Handlers = {
  POST: async (req) => {
    try {
      return await handle(req)
    } catch (err) {
      console.error(err)
      return new Response('Error processing update', { status: 500 })
    }
  },
  GET: async (req) => {
    try {
      if (config.POLLING_MODE) {
        return new Response('Bot is running in polling mode, no need to set webhook', { status: 400 })
      }

      const requestUrl = new URL(req.url)
      const webhookDomain = requestUrl.hostname

      if (webhookDomain === undefined) {
        return new Response('WEBHOOK_DOMAIN must be set in the environment variables', { status: 400 })
      }

      const webhookUrl = `https://${webhookDomain}/api/telegram/webhook`
      const response = await fetch(`https://api.telegram.org/bot${config.BOT_TOKEN}/setWebhook?url=${webhookUrl}`, { method: 'GET' })

      if (!response.ok) {
        return new Response(`Failed to set webhook: ${await response.text()}`, { status: 500 })
      }

      console.info('Webhook set successfully')
      return new Response(`Webhook set successfully to ${webhookUrl}`, { status: 200 })
    } catch (err) {
      console.error(err)
      return new Response('Error setting webhook', { status: 500 })
    }
  },
}
