import { LyricsService } from './lyrics.service.ts'
import { assert, assertExists } from '@std/assert'

Deno.test('LyricsService', async (t) => {
  const lyricsService = new LyricsService()

  await t.step('should find lyrics for popular songs', async () => {
    const result = await lyricsService.search({
      track: 'Bohemian Rhapsody',
      artist: 'Queen',
    })
    assertExists(result.lyrics)
  })

  await t.step('should handle non-existent songs', async () => {
    try {
      await lyricsService.search({
        track: 'Non-existent song',
        artist: 'Non-existent artist',
      })
      assert(false, 'Should have thrown an error for non-existent song')
    } catch (error) {
      assert(error instanceof Error)
    }
  })
})
