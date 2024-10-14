import 'jsr:@std/dotenv/load'

const webhookDomain = Deno.args[0]
const botToken = Deno.args[1]
const setWebhook = async () => {
  if (!webhookDomain) {
    throw new Error('WEBHOOK_DOMAIN is required as the first argument')
  }
  if (!botToken) {
    throw new Error('BOT_TOKEN is required as the second argument')
  }
  const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookDomain}/telegram/webhook`
  const response = await fetch(url, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`Failed to set webhook: ${await response.text()}`)
  }
  console.info('Webhook set successfully')
}

setWebhook()
