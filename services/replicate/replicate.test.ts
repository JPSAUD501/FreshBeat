import { assert } from '@std/assert'
import { ReplicateService } from './replicate.service.ts'

Deno.test('ReplicateService', async (t) => {
  const replicateService = new ReplicateService()

  await t.step('should create a image using flux', async () => {
    const result = await replicateService.flux.imagine('FreshBeat logo')
    assert(result.toString().length > 0)
  })

  await t.step('should create a image using sana', async () => {
    const result = await replicateService.sana.imagine('FreshBeat logo')
    assert(result.toString().length > 0)
  })
})
