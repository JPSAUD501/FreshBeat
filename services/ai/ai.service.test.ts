import { assert } from '@std/assert'
import { AiService } from './ai.service.ts'

Deno.test('AiService', async (t) => {
  const openaiAiService = new AiService('gpt-4o-mini')
  const anthropicAiService = new AiService('claude-3-5-haiku-latest')
  const googleAiService = new AiService('gemini-2.0-flash')

  await t.step('should generate a simple answer using gpt-4o-mini', async () => {
    const result = await openaiAiService.simpleAnswer('1+1=?')
    console.debug(result)
    assert(result.length > 0)
  })

  await t.step('should generate a simple answer using claude-3-5-haiku-latest', async () => {
    const result = await anthropicAiService.simpleAnswer('1+1=?')
    console.debug(result)
    assert(result.length > 0)
  })

  await t.step('should generate a simple answer using gemini-2-0-flash', async () => {
    const result = await googleAiService.simpleAnswer('1+1=?')
    console.debug(result)
    assert(result.length > 0)
  })
})
