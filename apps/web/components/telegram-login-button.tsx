'use client'

import { useEffect, useRef } from 'react'

/**
 * Telegram Login Widget: o script oficial só executa quando inserido
 * via DOM (não pode ser SSR). No login, o Telegram redireciona para
 * `authUrl` com os dados assinados — validados server-side.
 */
export function TelegramLoginButton({
  botUsername,
  authUrl,
}: {
  botUsername: string
  authUrl: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', authUrl)
    container.appendChild(script)
    return () => {
      container.innerHTML = ''
    }
  }, [botUsername, authUrl])

  return <div ref={containerRef} className="flex justify-center" />
}
