import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/** Dados enviados pelo Telegram Login Widget (todos strings). */
export type TelegramLoginData = Record<string, string>

export interface TelegramProfile {
  telegramUserId: number
  firstName: string
  username: string | null
  photoUrl: string | null
}

/** Login expira em 24h — defesa contra replay de URL assinada. */
export const TELEGRAM_LOGIN_MAX_AGE_SECONDS = 24 * 60 * 60

/**
 * Valida o payload do Telegram Login Widget:
 * hash = HMAC-SHA256(data-check-string, chave = SHA256(bot_token)),
 * onde data-check-string são os pares key=value ordenados (sem `hash`),
 * separados por \n. Retorna o perfil ou null se inválido/expirado.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function validateTelegramLogin(
  data: TelegramLoginData,
  botToken: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): TelegramProfile | null {
  const hash = data.hash
  if (hash === undefined || !/^[0-9a-f]{64}$/.test(hash)) return null

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const expected = createHmac('sha256', secretKey).update(checkString).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const hashBuffer = Buffer.from(hash, 'utf8')
  if (expectedBuffer.length !== hashBuffer.length || !timingSafeEqual(expectedBuffer, hashBuffer)) {
    return null
  }

  const authDate = Number(data.auth_date)
  if (!Number.isFinite(authDate) || nowSeconds - authDate > TELEGRAM_LOGIN_MAX_AGE_SECONDS) {
    return null
  }

  const telegramUserId = Number(data.id)
  if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) return null

  return {
    telegramUserId,
    firstName: data.first_name ?? '',
    username: data.username ?? null,
    photoUrl: data.photo_url ?? null,
  }
}
