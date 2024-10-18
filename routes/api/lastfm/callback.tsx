import { Head } from '$fresh/runtime.ts'
import { encodeBase64Url } from '@std/encoding'
import { TelegramBotService } from '../../../bot/bot.service.ts'
import MiniappCallback from '../../../islands/MiniappCallback.tsx'
import Redirect from '../../../islands/Redirect.tsx'

export default async function RedirectPage(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const telegramBotService = new TelegramBotService({ domain: url.hostname })
  const botInfo = await telegramBotService.getBot()
  const botUser = botInfo.username
  const startData = {
    token,
  }
  const startDataString = encodeBase64Url(JSON.stringify(startData))
  const redirectUrl = `https://telegram.me/${botUser}?start=${startDataString}`

  return (
    <>
      <Head>
        <script src='https://telegram.org/js/telegram-web-app.js'></script>
      </Head>
      <div class='flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-6'>
        <h1 class='text-2xl font-bold mb-4 text-gray-800'>
          Você está sendo redirecionado para o Telegram...
        </h1>
        <p class='text-lg text-gray-600 mb-8'>
          Caso não seja redirecionado automaticamente, clique{' '}
          <a href={redirectUrl} class='text-blue-500 underline hover:text-blue-700'>
            aqui
          </a>.
        </p>
        <p class='text-sm text-gray-500 mb-12'>
          Após o Telegram abrir, você pode fechar esta página com segurança.
        </p>
        <MiniappCallback data={{ token }} />
        <Redirect url={redirectUrl} delay={1000} />
      </div>
    </>
  )
}
