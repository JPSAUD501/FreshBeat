import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildLastfmAuthUrl, fetchLastfmSessionUsername } from './lastfm-auth'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildLastfmAuthUrl', () => {
  it('monta a URL de autorização com api_key e callback', () => {
    const url = buildLastfmAuthUrl('KEY', 'https://site.test/cb?state=abc')
    expect(url).toBe(
      `https://www.last.fm/api/auth/?api_key=KEY&cb=${encodeURIComponent('https://site.test/cb?state=abc')}`,
    )
  })
})

describe('fetchLastfmSessionUsername', () => {
  it('assinatura md5: parâmetros ordenados + secret', async () => {
    const expectedSig = createHash('md5')
      .update('api_keyKEYmethodauth.getSessiontokenTOK' + 'SECRET')
      .digest('hex')
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ session: { name: 'joao' } }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const username = await fetchLastfmSessionUsername({
      apiKey: 'KEY',
      apiSecret: 'SECRET',
      token: 'TOK',
    })

    expect(username).toBe('joao')
    const calledUrl = new URL(fetchMock.mock.calls[0]![0] as string)
    expect(calledUrl.searchParams.get('api_sig')).toBe(expectedSig)
    expect(calledUrl.searchParams.get('method')).toBe('auth.getSession')
    expect(calledUrl.searchParams.get('format')).toBe('json')
  })

  it('retorna null quando a API responde erro HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('err', { status: 403 })))
    expect(await fetchLastfmSessionUsername({ apiKey: 'K', apiSecret: 'S', token: 'T' })).toBeNull()
  })

  it('retorna null quando a sessão não vem no corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 4 }), { status: 200 })),
    )
    expect(await fetchLastfmSessionUsername({ apiKey: 'K', apiSecret: 'S', token: 'T' })).toBeNull()
  })

  it('retorna null em falha de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    expect(await fetchLastfmSessionUsername({ apiKey: 'K', apiSecret: 'S', token: 'T' })).toBeNull()
  })
})
