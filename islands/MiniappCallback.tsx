// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    (globalThis as any).Telegram.WebApp.sendData(JSON.stringify({
      lastfm_token: props.data.token,
    }));
  }, [props.data.token]);
  return null;
}
