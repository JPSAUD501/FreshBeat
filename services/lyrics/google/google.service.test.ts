import { GoogleService } from './google.service.ts'
import { assert, assertExists } from '@std/assert'

Deno.test('GoogleService', async (t) => {
  const googleService = new GoogleService()

  await t.step('should find lyrics', async () => {
    const result = await googleService.search({
      track: 'Imagine',
      artist: 'John Lennon',
    })
    assertExists(result.lyrics)
  })

  await t.step('should handle non-existent songs', async () => {
    try {
      await googleService.search({
        track: 'Non-existent song',
        artist: 'Non-existent artist',
      })
      assert(false, 'Should have thrown an error for non-existent song')
    } catch (error) {
      assert(error instanceof Error)
    }
  })
})
