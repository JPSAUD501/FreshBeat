// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    console.log("Sending data to Telegram:", props.data);
    (globalThis as any).TelegramWebviewProxy.postEvent("web_app_data_send", JSON.stringify(props.data));
  }, [props]);
  return null
}
