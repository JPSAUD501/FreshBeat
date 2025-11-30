import type { PageProps } from '$fresh/server.ts'
import Redirect from '../../islands/Redirect.tsx'
import { DBService } from '../../services/db/db.service.ts'
import { KeyvalueService } from '../../services/keyvalue/keyvalue.service.ts'

export default async function GotoPage(props: PageProps) {
  const goTo = new URL(props.url).searchParams.get('to')
  if (goTo === null) return Response.redirect('/', 302)
  const url = new URL(decodeURIComponent(goTo))
  const redirectDelay = 1000
  const uuid = new URL(props.url).searchParams.get('uuid')
  if (uuid !== null) {
    const dbService = new DBService()
    const keyvalueService = new KeyvalueService(dbService)
    const dbKeyvalue = await keyvalueService.findOneByKey(uuid)
    if (dbKeyvalue !== null) {
      await keyvalueService.update(dbKeyvalue.id, { value: JSON.stringify({ used: true }) })
    }
  }

  return (
    <>
      <div class='flex flex-col items-center justify-center h-screen bg-gray-900 text-center p-4'>
        <div class='bg-gray-800 border border-gray-700 shadow-2xl rounded-xl p-8 w-full max-w-md'>
          <h1 class='text-2xl font-bold text-white mb-6 tracking-wide'>
            Redirecionando para <span class="text-[#86efac]">"{url.hostname}"</span>
          </h1>
          <p class='text-base text-gray-400 mb-8 leading-relaxed'>
            Caso não seja redirecionado automaticamente em <span class="font-semibold text-gray-300">{redirectDelay / 1000} segundos</span>, clique no botão abaixo.
          </p>
          <a href={url.toString()} class='btn btn-outline btn-md text-white border-gray-500 hover:bg-[#86efac] hover:text-gray-900 hover:border-[#86efac] w-full mb-2 no-animation transition-colors duration-300 rounded-lg font-semibold'>
            Ir para {url.hostname}
          </a>
        </div>
        <Redirect url={url.toString()} delay={redirectDelay} />
      </div>
    </>
  )
}
