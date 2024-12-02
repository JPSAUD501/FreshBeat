import { Auth } from './auth.service.ts'
import { assertExists } from '@std/assert'

Deno.test('AuthService', async (t) => {
  const auth = new Auth()

  await t.step('should retrieve client ID', async () => {
    const clientId = await auth.getClientId()
    assertExists(clientId)
  })
})
