// deno-lint-ignore-file no-explicit-any
import { useEffect } from 'preact/hooks'

export default function MiniappCallback(props: { data: Record<string, unknown> }) {
  useEffect(() => {
    ;(globalThis as any).Telegram.WebApp.sendData(JSON.stringify({
      data: JSON.stringify({ token: props.data.token }),
      button_text: '',
    }))
  }, [props.data.token])
  return null
}
