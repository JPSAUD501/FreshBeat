import { assert } from '@std/assert'
import { ConverterService } from './converter.service.ts'

Deno.test('ConverterService', async (t) => {
  const converterService = new ConverterService()

  await t.step('should create svg converter', () => {
    const svgContent = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="white"/></svg>'
    const svgConverter = converterService.svg(svgContent)
    assert(svgConverter !== null)
    assert(svgConverter.to.jpeg !== undefined)
    assert(svgConverter.to.png !== undefined)
  })

  await t.step('should handle empty SVG', () => {
    const svgContent = ''
    const svgConverter = converterService.svg(svgContent)
    assert(svgConverter !== null)
  })

  await t.step('should handle complex SVG', () => {
    const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="blue"/>
      <circle cx="100" cy="100" r="50" fill="red"/>
      <text x="50" y="100" font-size="20" fill="white">Hello</text>
    </svg>`
    const svgConverter = converterService.svg(svgContent)
    assert(svgConverter !== null)
  })
})
