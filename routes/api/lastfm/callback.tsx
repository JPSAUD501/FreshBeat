import { Handlers, PageProps } from "$fresh/server.ts";
import MiniappCallback from '../../../islands/MiniappCallback.tsx'

export const handler: Handlers = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    console.log("Token:", token);
    return ctx.render({ token });
  },
};

export default function Webhook(props: PageProps) {
  const token = props.url.searchParams.get("token");
  return (
    <div>
      <h1>Sending token to Telegram...</h1>
      <MiniappCallback data={{ token }} />
    </div>
  );
}
