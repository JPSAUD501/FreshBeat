import { assert } from '@std/assert'
import { YouTubeService } from './youtube.service.ts'

Deno.test('YouTubeService', async (t) => {
  const youtubeService = new YouTubeService()

  await t.step('should get track info', async () => {
    const result = await youtubeService.track.getTrackInfo({
      track: 'Shape of You',
      artist: 'Ed Sheeran',
      limit: 1,
    })
    assert(result.length > 0)
    assert(result[0].id !== undefined)
    assert(result[0].title !== undefined)
    assert(result[0].musicLink !== undefined)
    assert(result[0].musicLink.includes('music.youtube.com'))
  })

  await t.step('should search for multiple tracks', async () => {
    const result = await youtubeService.track.getTrackInfo({
      track: 'Bohemian Rhapsody',
      artist: 'Queen',
      limit: 5,
    })
    assert(result.length <= 5)
    assert(result.length > 0)
  })

  await t.step('should have musicLink with valid video ID', async () => {
    const result = await youtubeService.track.getTrackInfo({
      track: 'Imagine',
      artist: 'John Lennon',
      limit: 1,
    })
    assert(result.length > 0)
    const video = result[0]
    assert(video.musicLink.startsWith('https://music.youtube.com/watch?v='))
    assert(video.id !== undefined)
  })
})
