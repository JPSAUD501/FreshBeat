import { assert } from '@std/assert'
import { ConverterSvgService } from './svg.service.ts'

const sampleSvg = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="white"/>
  <rect width="100" height="50" fill="black"/>
</svg>
`

Deno.test('SvgConverter', async (t) => {
  await t.step('should convert SVG to JPEG', async () => {
    const converter = new ConverterSvgService(sampleSvg)
    const jpegData = await converter.to.jpeg()
    assert(jpegData.length > 0, 'JPEG data should not be empty')
  })

  await t.step('should convert SVG to PNG', async () => {
    const converter = new ConverterSvgService(sampleSvg)
    const pngData = await converter.to.png()
    assert(pngData.length > 0, 'PNG data should not be empty')
  })
})
