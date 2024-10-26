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
      <div class='flex flex-col items-center h-screen bg-gray-900 text-center p-4'>
        <div class='bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mt-4'>
          <h1 class='text-xl font-bold text-white mb-4'>
            Redirecionando para "{url.hostname}"
          </h1>
          <p class='text-base text-gray-400 mb-4'>
            Caso não seja redirecionado automaticamente em {redirectDelay / 1000} segundos, clique no botão abaixo.
          </p>
          <a href={url.toString()} class='btn btn-outline btn-sm text-white border-white hover:bg-yellow-600 hover:text-white w-full mb-4 no-animation'>
            Ir para {url.hostname}
          </a>
        </div>
        <Redirect url={url.toString()} delay={redirectDelay} />
      </div>
    </>
  )
}
