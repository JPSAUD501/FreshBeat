import { describe, expect, it } from 'vitest'
import { decodeSession, encodeSession, newSessionPayload } from './session'

const SECRET = 'a'.repeat(32)

describe('session', () => {
  it('roundtrip encode/decode', () => {
    const payload = newSessionPayload(42, 'João')
    const cookie = encodeSession(payload, SECRET)
    expect(decodeSession(cookie, SECRET)).toEqual(payload)
  })

  it('rejeita assinatura adulterada', () => {
    const cookie = encodeSession(newSessionPayload(42, 'João'), SECRET)
    const tampered = `${cookie.slice(0, -2)}xx`
    expect(decodeSession(tampered, SECRET)).toBeNull()
  })

  it('rejeita segredo diferente', () => {
    const cookie = encodeSession(newSessionPayload(42, 'João'), SECRET)
    expect(decodeSession(cookie, 'b'.repeat(32))).toBeNull()
  })

  it('rejeita sessão expirada', () => {
    const payload = { telegramUserId: 42, firstName: 'João', exp: 1000 }
    const cookie = encodeSession(payload, SECRET)
    expect(decodeSession(cookie, SECRET, 1001)).toBeNull()
  })

  it('rejeita cookie malformado', () => {
    expect(decodeSession(undefined, SECRET)).toBeNull()
    expect(decodeSession('sem-ponto', SECRET)).toBeNull()
    expect(decodeSession('!!!.###', SECRET)).toBeNull()
  })
})
