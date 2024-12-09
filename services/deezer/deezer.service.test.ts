import { assert } from '@std/assert'
import { DeezerService } from './deezer.service.ts'

Deno.test('DeezerService', async (t) => {
  const deezerService = new DeezerService()

  await t.step('should search for a track', async () => {
    const result = await deezerService.track.search({
      track: 'Shape of You',
      artist: 'Ed Sheeran',
      limit: 1,
    })
    assert(result.data.length === 1)
  })

  await t.step('should search for an artist', async () => {
    const result = await deezerService.artist.search({
      artist: 'Adele',
      limit: 1,
    })
    assert(result.data.length === 1)
  })

  await t.step('should search for an album', async () => {
    const result = await deezerService.album.search({
      album: '25',
      limit: 1,
    })
    assert(result.data.length === 1)
  })
})
