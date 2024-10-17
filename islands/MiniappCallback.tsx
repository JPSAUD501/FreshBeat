import { useEffect } from "preact/hooks";

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    globalThis.parent.postMessage(JSON.stringify({ eventType: "web_app_data_send", eventData: JSON.stringify(props.data)}), '*');
  }, [props]);
  return null
}
