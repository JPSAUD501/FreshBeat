// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    const loadTelegramScript = () => {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        (globalThis as any).Telegram.WebApp.sendData(JSON.stringify({
          lastfm_token: props.data.token,
        }));
        console.log("Sent token to Telegram Web App");
      };
    };
    loadTelegramScript();
  }, [props]);
  return null;
}
