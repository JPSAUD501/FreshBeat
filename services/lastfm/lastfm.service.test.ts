import { assertEquals } from 'https://deno.land/std@0.100.0/testing/asserts.ts'
import { LastFmService } from './lastfm.service.ts'
import { config } from '../../config.ts'

Deno.test({
  name: 'getSignature generates correct signature',
  fn: async () => {
    const lastfmService = new LastFmService({ apiKey: 'xxxxxxxxxx', apiSecret: 'ilovecher' })

    const parameters = {
      api_key: 'xxxxxxxxxx',
      method: 'auth.getSession',
      token: 'yyyyyy',
    }

    const signature = await lastfmService.auth.getSignature({ parameters })
    const expectedSignature = 'b87d61da3cda91a8b6746c4aef55d6f8'

    assertEquals(signature, expectedSignature)
  },
})

Deno.test({
  name: 'getSession returns session data',
  fn: async () => {
    const lastfmService = new LastFmService({ apiKey: config.LASTFM_API_KEY, apiSecret: config.LASTFM_API_SECRET })
    const token = 'UxpzTVkC_TdIn6KekS9T_bx_CNdZxdxQ'
    const response = await lastfmService.auth.getSession({ token })
    console.log(response)
  },
})
