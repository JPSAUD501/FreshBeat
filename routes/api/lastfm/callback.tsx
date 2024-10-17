import { PageProps } from "$fresh/server.ts";
import { Head } from '$fresh/runtime.ts'
import MiniappCallback from '../../../islands/MiniappCallback.tsx'

export default function Webhook(props: PageProps) {
  const token = props.url.searchParams.get("token");
  return (
    <div>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </Head>
      <div class="flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Last.fm Authorization</h1>
        <p class="my-4">
          Please wait while we send your token to Telegram.
        </p>
        <MiniappCallback data={{ token }} />
      </div>
    </div>
  );
}
