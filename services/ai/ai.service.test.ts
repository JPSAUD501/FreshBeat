import { assert } from '@std/assert'
import { AiService } from './ai.service.ts'

Deno.test('AiService', async (t) => {
  const gpt5Mini = new AiService('openai/gpt-5-mini')
  const kimi = new AiService('moonshotai/kimi-k2-0905')

  await t.step('should generate a simple answer using openai/gpt-5-mini via OpenRouter', async () => {
    const result = await gpt5Mini.simpleAnswer('1+1=?')
    console.debug(result)
    assert(result.length > 0)
  })

  await t.step('should generate a simple answer using moonshotai/kimi-k2-0905 via OpenRouter', async () => {
    const result = await kimi.simpleAnswer('1+1=?')
    console.debug(result)
    assert(result.length > 0)
  })
})
