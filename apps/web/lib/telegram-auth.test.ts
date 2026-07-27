import { createHash, createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { validateTelegramLogin, type TelegramLoginData } from './telegram-auth'

const BOT_TOKEN = '123:ABC'

/** Assina os dados como o Telegram faria. */
function signTelegramData(data: TelegramLoginData, botToken: string): TelegramLoginData {
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')
  const secret = createHash('sha256').update(botToken).digest()
  return { ...data, hash: createHmac('sha256', secret).update(checkString).digest('hex') }
}

const NOW = 1_800_000_000

function validData(): TelegramLoginData {
  return signTelegramData(
    {
      id: '42',
      first_name: 'João',
      username: 'joao',
      auth_date: String(NOW - 60),
    },
    BOT_TOKEN,
  )
}

describe('validateTelegramLogin', () => {
  it('aceita payload assinado corretamente', () => {
    expect(validateTelegramLogin(validData(), BOT_TOKEN, NOW)).toEqual({
      telegramUserId: 42,
      firstName: 'João',
      username: 'joao',
      photoUrl: null,
    })
  })

  it('rejeita hash adulterado', () => {
    const data = { ...validData(), first_name: 'Mallory' }
    expect(validateTelegramLogin(data, BOT_TOKEN, NOW)).toBeNull()
  })

  it('rejeita token de bot diferente', () => {
    expect(validateTelegramLogin(validData(), '999:OUTRO', NOW)).toBeNull()
  })

  it('rejeita login expirado', () => {
    const data = signTelegramData(
      { id: '42', first_name: 'João', auth_date: String(NOW - 90_000) },
      BOT_TOKEN,
    )
    expect(validateTelegramLogin(data, BOT_TOKEN, NOW)).toBeNull()
  })

  it('rejeita payload sem hash ou com id inválido', () => {
    expect(validateTelegramLogin({ id: '42' }, BOT_TOKEN, NOW)).toBeNull()
    const badId = signTelegramData(
      { id: 'abc', first_name: 'X', auth_date: String(NOW) },
      BOT_TOKEN,
    )
    expect(validateTelegramLogin(badId, BOT_TOKEN, NOW)).toBeNull()
  })
})
