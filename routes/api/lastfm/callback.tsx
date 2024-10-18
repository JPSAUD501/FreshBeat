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
      <div class='flex flex-col items-center justify-start h-screen bg-base-200 text-center p-4 mt-4'>
        <div class='bg-white shadow-lg rounded-lg p-6 w-full max-w-md'>
          <div class="flex items-center justify-center mb-4">
            <img src="https://telegram.org/img/t_logo.png" alt="Telegram Logo" class="w-10 h-10 mr-2" />
            <h1 class='text-xl font-bold text-blue-600'>
              Redirecionando para o Telegram
            </h1>
          </div>
          <p class='text-base text-gray-600 mb-4'>
            Caso não seja redirecionado automaticamente, clique no botão abaixo.
          </p>
          <a href={redirectUrl} class='btn btn-outline btn-sm text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white w-full mb-4'>
            Abrir no Telegram
          </a>
          <p class='text-sm text-gray-500'>
            Após o Telegram abrir, você pode fechar esta página com segurança.
          </p>
        </div>
        <MiniappCallback data={{ token }} />
        <Redirect url={redirectUrl} delay={20000} />
      </div>
    </>
  )
}
