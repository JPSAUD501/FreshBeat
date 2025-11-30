import { Head } from '$fresh/runtime.ts'
import { TelegramBotService } from '../../../services/telegram/bot/bot.service.ts'
import MiniappCallback from '../../../islands/MiniappCallback.tsx'
import Redirect from '../../../islands/Redirect.tsx'
import type { PageProps } from '$fresh/server.ts'
import { StartComposer } from '../../../services/telegram/bot/functions/start/start.composer.ts'

export default async function RedirectPage(props: PageProps) {
  const token = new URL(props.url).searchParams.get('token')
  const telegramBotService = new TelegramBotService({ domain: props.url.hostname })
  const botInfo = await telegramBotService.getBot()
  const botUser = botInfo.username
  const startDataString = StartComposer.encodeStartProps({
    token: token ?? undefined,
  })
  const redirectUrl = `https://telegram.me/${botUser}?start=${startDataString}`
  const redirectDelay = 2000

  return (
    <>
      <Head>
        <script src='https://telegram.org/js/telegram-web-app.js'></script>
      </Head>
      <div class='flex flex-col items-center justify-center h-screen bg-gray-900 text-center p-4'>
        <div class='bg-gray-800 border border-gray-700 shadow-2xl rounded-xl p-8 w-full max-w-md'>
          <h1 class='text-2xl font-bold text-white mb-6 tracking-wide'>
            Redirecionando para o Telegram
          </h1>
          <p class='text-base text-gray-400 mb-8 leading-relaxed'>
            Caso não seja redirecionado automaticamente em <span class="font-semibold text-gray-300">{redirectDelay / 1000} segundos</span>, clique no botão abaixo.
          </p>
          <a href={redirectUrl} class='btn btn-outline btn-md text-white border-gray-500 hover:bg-[#86efac] hover:text-gray-900 hover:border-[#86efac] w-full mb-6 no-animation transition-colors duration-300 rounded-lg font-semibold'>
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
