/**
 * Valores públicos de exibição (seguros para ir ao client).
 * Rotas de API usam `loadConfig()` do @freshbeat/config — lá o
 * fail-fast é o comportamento desejado. Aqui preferimos defaults
 * amigáveis para não quebrar a landing em dev sem env completo.
 */
export const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME ?? 'FreshBeatBot'
export const TELEGRAM_BOT_URL = `https://t.me/${BOT_USERNAME}`
export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com/JPSAUD501/FreshBeat'
