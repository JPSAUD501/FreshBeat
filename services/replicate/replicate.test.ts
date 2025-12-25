import { assert } from '@std/assert'
import { ReplicateService } from './replicate.service.ts'

Deno.test('ReplicateService', async (t) => {
  const replicateService = new ReplicateService()

  await t.step('should create a image using zImageUltra', async () => {
    const result = await replicateService.zImageUltra.imagine('FreshBeat logo')
    assert(result instanceof ArrayBuffer)
    assert(result.byteLength > 0)
  })
})
