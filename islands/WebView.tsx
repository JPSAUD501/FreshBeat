import { useEffect } from "preact/hooks";

export default function WebView() {
  useEffect(() => {
    const handleNavigation = (event: MessageEvent) => {
      const newUrl = event.data;

      // Quando o usuário for redirecionado para fora do last.fm, envia um POST para a API.
      if (!newUrl.includes("last.fm")) {
        fetch("https://sua-api.com/post-endpoint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ redirectUrl: newUrl }),
        });
      }
    };

    globalThis.addEventListener("message", handleNavigation);

    return () => {
      globalThis.removeEventListener("message", handleNavigation);
    };
  }, []);

  return (
    <iframe
      id="lastfm-webview"
      src="https://www.last.fm/pt/join"
      style={{ width: "80%", height: "80vh", border: "none" }}
      onLoad={() => {
        const iframe = document.getElementById("lastfm-webview") as HTMLIFrameElement;
        iframe.contentWindow?.postMessage(iframe.src, "*");

        iframe.addEventListener("load", () => {
          const newUrl = iframe.contentWindow?.location.href;
          if (newUrl && !newUrl.includes("last.fm")) {
            globalThis.postMessage(newUrl, "*");
          }
        });
      }}
    />
  );
}
