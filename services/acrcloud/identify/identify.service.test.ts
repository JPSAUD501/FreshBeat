import { config } from '../../../config.ts'
import { Identify } from './identify.service.ts'
import { assert } from '@std/assert'

Deno.test('IdentifyService', async (t) => {
  const identifyService = new Identify(config.ACRCLOUD_API_KEY, config.ACRCLOUD_API_SECRET)

  await t.step('should identify a track from audio', async () => {
    const audioData = Deno.readFileSync('./media/tests/acrcloud/sucker.mp3')
    const result = await identifyService.track(audioData)
    assert(result.metadata.music && result.metadata.music.length > 0)
  })
})
