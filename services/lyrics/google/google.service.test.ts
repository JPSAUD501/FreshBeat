import { GoogleService } from './google.service.ts'
import { assert, assertExists } from '@std/assert'

Deno.test('GoogleService', async (t) => {
  const googleService = new GoogleService()

  await t.step('should find lyrics for Dollhouse by Melanie Martinez', async () => {
    const result = await googleService.search({
      track: 'Dollhouse',
      artist: 'Melanie Martinez',
    })
    assertExists(result.lyrics)
  })

  await t.step('should find lyrics for Mantra by JENNIE', async () => {
    const result = await googleService.search({
      track: 'Mantra',
      artist: 'JENNIE',
    })
    assertExists(result.lyrics)
  })

  await t.step('should handle non-existent songs', async () => {
    try {
      await googleService.search({
        track: 'ThisSongDoesNotExist123',
        artist: 'ThisArtistDoesNotExist123',
      })
      assert(false, 'Should have thrown an error for non-existent song')
    } catch (error) {
      assert(error instanceof Error)
    }
  })
})
