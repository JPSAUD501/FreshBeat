import { assert } from '@std/assert'
import { SpotifyService } from './spotify.service.ts'

Deno.test('SpotifyService', async (t) => {
  const spotifyService = new SpotifyService()

  await t.step('should get track info', async () => {
    const result = await spotifyService.track.getTrackInfo({
      track: 'Shape of You',
      artist: 'Ed Sheeran',
      limit: 1,
    })
    assert(result.length > 0)
    assert(result[0].name === 'Shape of You')
  })

  await t.step('should get artist info', async () => {
    const result = await spotifyService.artist.getArtistInfo({
      artist: 'Adele',
      limit: 1,
    })
    assert(result.length > 0)
    assert(result[0].name === 'Adele')
  })

  await t.step('should get album info', async () => {
    const result = await spotifyService.album.getAlbumInfo({
      album: '25',
      artist: 'Adele',
      limit: 1,
    })
    assert(result.length > 0)
    assert(result[0].name === '25 Adele')
  })
})
