import { Head } from '$fresh/runtime.ts'
import type { PageProps } from '$fresh/server.ts'

export default function Error404(props: PageProps) {
  const url = props.url.href
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8'>
        <div class='max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center'>
          <div class='text-8xl mb-6 drop-shadow-sm'>🍋</div>
          <h1 class='text-4xl font-extrabold text-gray-900 mb-2'>404 - Page not found</h1>
          <p class='text-lg text-gray-600 my-6 leading-relaxed'>
            The page <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-500 break-all">{url}</code> doesn't exist.
          </p>
          <a href='/' class='btn bg-[#86efac] hover:bg-[#6ee7b7] text-gray-900 border-none shadow-md hover:shadow-lg transition-all duration-200 rounded-full px-8 font-bold'>
            Go back home
          </a>
        </div>
      </div>
    </>
  )
}
