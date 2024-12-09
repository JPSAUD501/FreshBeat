import { assert } from '@std/assert'
import { LastFmService } from './lastfm.service.ts'

Deno.test('LastFmService', async (t) => {
  const lastFmService = new LastFmService()

  await t.step('should get user info', async () => {
    const result = await lastFmService.user.getInfo({ username: 'JPSAUD501' })
    assert(result.user.name === 'JPSAUD501')
  })

  await t.step('should get recent tracks', async () => {
    const result = await lastFmService.user.getRecentTracks({
      username: 'JPSAUD501',
      limit: '1',
      page: '1',
    })
    assert(result.recenttracks.track.length > 0)
  })

  await t.step('should get top artists', async () => {
    const result = await lastFmService.user.getTopArtists({
      username: 'JPSAUD501',
      limit: '1',
      page: '1',
    })
    assert(result.topartists.artist.length > 0)
  })

  await t.step('should get top albums', async () => {
    const result = await lastFmService.user.getTopAlbums({
      username: 'JPSAUD501',
      limit: '1',
      page: '1',
    })
    assert(result.topalbums.album.length > 0)
  })

  await t.step('should get top tracks', async () => {
    const result = await lastFmService.user.getTopTracks({
      username: 'JPSAUD501',
      limit: '1',
      page: '1',
    })
    assert(result.toptracks.track.length > 0)
  })

  await t.step('should get artist info', async () => {
    const result = await lastFmService.artist.getInfo({
      artist: 'Adele',
    })
    assert(result.artist.name === 'Adele')
  })

  await t.step('should get album info', async () => {
    const result = await lastFmService.album.getInfo({
      artist: 'Adele',
      album: '25',
    })
    assert(result.album.name === '25')
  })

  await t.step('should get track info', async () => {
    const result = await lastFmService.track.getInfo({
      artist: 'Ed Sheeran',
      track: 'Shape of You',
    })
    assert(result.track.name === 'Shape of You')
  })

  await t.step('should get artist info with userplaycount', async () => {
    const result = await lastFmService.artist.getInfo({
      artist: 'Adele',
      username: 'JPSAUD501',
    })
    assert(result.artist.name === 'Adele')
    assert(result.artist.stats.userplaycount !== undefined)
    assert(parseInt(result.artist.stats.userplaycount) >= 0)
  })

  await t.step('should get album info with userplaycount', async () => {
    const result = await lastFmService.album.getInfo({
      artist: 'Adele',
      album: '25',
      username: 'JPSAUD501',
    })
    assert(result.album.name === '25')
    assert(result.album.userplaycount !== undefined)
    assert(result.album.userplaycount >= 0)
  })

  await t.step('should get track info with userplaycount', async () => {
    const result = await lastFmService.track.getInfo({
      artist: 'Ed Sheeran',
      track: 'Shape of You',
      username: 'JPSAUD501',
    })
    assert(result.track.name === 'Shape of You')
    assert(result.track.userplaycount !== undefined)
    assert(parseInt(result.track.userplaycount) >= 0)
  })

  await t.step('should search for a track', async () => {
    const result = await lastFmService.track.search({
      track: 'Shape of You',
      limit: '1',
      page: '1',
    })
    assert(result.results.trackmatches.track.length > 0)
  })
})
