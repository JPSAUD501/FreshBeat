import { assert } from '$std/assert/assert.ts'
import { Svg } from './svg.service.ts'

Deno.test('SvgConverter.to.jpeg() converts SVG to JPEG', async () => {
  const svgContent =
`
<svg width="147" height="147" viewBox="0 0 147 147" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="147" height="147" fill="white"/>
  <rect width="147" height="69" fill="black"/>
</svg>
`
  const converter = new Svg(svgContent)
  const jpegData = await converter.to.jpeg()

  assert(jpegData.length > 0, 'JPEG data should not be empty')
})

Deno.test('SvgConverter.to.png() converts SVG to PNG', async () => {
  const svgContent =
`
<svg width="147" height="147" viewBox="0 0 147 147" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="147" height="147" fill="white"/>
  <rect width="147" height="69" fill="black"/>
</svg>
`
  const converter = new Svg(svgContent)
  const pngData = await converter.to.png()

  assert(pngData.length > 0, 'PNG data should not be empty')
})
