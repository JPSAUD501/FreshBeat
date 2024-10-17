// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    (globalThis as any).TelegramWebviewProxy.postEvent("web_app_data_send", JSON.stringify(props.data));
  }, [props]);
  return null
}
