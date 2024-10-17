// deno-lint-ignore-file no-explicit-any
import { Handlers } from '$fresh/server.ts'

export const handler: Handlers = {
  GET: async (req) => {
    try {
      const url = new URL(req.url);
      const token = url.searchParams.get('token');
      await (globalThis as any).TelegramWebviewProxy.postEvent('web_app_data_send', JSON.stringify({
        lastfm_token: token,
      }));
      console.log('Sent token to webview');
      return Response.redirect('https://fresbeat.deno.dev');
    } catch (err) {
      console.error(err)
      return Response.json(err, { status: 500 })
    }
  },
}
