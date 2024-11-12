import { MusixmatchService } from './musixmatch.service.ts'
import { assert, assertExists } from '@std/assert'

Deno.test('MusixmatchService', async (t) => {
  const musixmatchService = new MusixmatchService()

  await t.step('should find lyrics', async () => {
    const result = await musixmatchService.search({
      track: 'Imagine',
      artist: 'John Lennon',
    })
    assertExists(result.lyrics)
  })

  await t.step('should handle non-existent songs', async () => {
    try {
      await musixmatchService.search({
        track: 'Non-existent song',
        artist: 'Non-existent artist',
      })
      assert(false, 'Should have thrown an error for non-existent song')
    } catch (error) {
      assert(error instanceof Error)
    }
  })
})
