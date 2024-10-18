import { Head } from '$fresh/runtime.ts'
import { encodeBase64Url } from '@std/encoding'
import { TelegramBotService } from '../../../bot/bot.service.ts'
import MiniappCallback from '../../../islands/MiniappCallback.tsx'
import Redirect from '../../../islands/Redirect.tsx'
import type { PageProps } from '$fresh/server.ts'



export default async function RedirectPage(props: PageProps) {
  const token = new URL(props.url).searchParams.get('token')
  const telegramBotService = new TelegramBotService({ domain: props.url.hostname })
  const botInfo = await telegramBotService.getBot()
  const botUser = botInfo.username
  const startData = {
    token,
  }
  const startDataString = encodeBase64Url(JSON.stringify(startData))
  const redirectUrl = `https://telegram.me/${botUser}?start=${startDataString}`
  const redirectDelay = 2000

  return (
    <>
      <Head>
        <script src='https://telegram.org/js/telegram-web-app.js'></script>
      </Head>
      <div class='flex flex-col items-center h-screen bg-gray-900 text-center p-4'>
        <div class='bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mt-4'>
          <h1 class='text-xl font-bold text-white mb-4'>
            Redirecionando para o Telegram
          </h1>
          <p class='text-base text-gray-400 mb-4'>
            Caso não seja redirecionado automaticamente em {redirectDelay / 1000} segundos, clique no botão abaixo.
          </p>
          <a href={redirectUrl} class='btn btn-outline btn-sm text-white border-white hover:bg-yellow-600 hover:text-white w-full mb-4 no-animation'>
            Abrir no Telegram
          </a>
          <p class='text-sm text-gray-500'>
            Após o Telegram abrir, você pode fechar esta página com segurança.
          </p>
        </div>
        <MiniappCallback data={{ token }} />
        <Redirect url={redirectUrl} delay={redirectDelay} />
      </div>
    </>
  )
}
