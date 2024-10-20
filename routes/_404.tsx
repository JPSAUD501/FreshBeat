import { Head } from '$fresh/runtime.ts'
import type { PageProps } from '$fresh/server.ts'

export default function Error404(props: PageProps) {
  const url = props.url.href
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class='px-4 py-8 mx-auto bg-[#86efac]'>
        <div class='max-w-screen-md mx-auto flex flex-col items-center justify-center'>
          <div class='text-6xl mb-4'>🍋</div>
          <h1 class='text-4xl font-bold'>404 - Page not found</h1>
          <p class='my-4'>
            The page <code>{url}</code> doesn't exist.
          </p>
          <a href='/' class='underline'>Go back home</a>
        </div>
      </div>
    </>
  )
}
