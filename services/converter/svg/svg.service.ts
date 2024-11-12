import { initWasm, Resvg } from '@resvg/resvg-wasm'
import jpeg from 'jpeg-js'

export class ConverterSvgService {
  private wasmUrl = 'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
  private svgContent: string

  constructor(svgContent: string) {
    this.svgContent = svgContent
  }

  private async initializeWasm() {
    await initWasm(this.wasmUrl).catch((_err) => {})
  }

  get to() {
    return {
      jpeg: async (): Promise<Uint8Array> => {
        await this.initializeWasm()
        const resvg = new Resvg(this.svgContent, {
          background: 'white',
          fitTo: {
            mode: 'original',
          },
        })
        const image = resvg.render()
        const rgbaData = image.pixels
        const width = image.width
        const height = image.height

        const rawImageData = {
          data: rgbaData,
          width,
          height,
        }

        const jpegImageData = jpeg.encode(rawImageData, 90)
        return jpegImageData.data
      },
      png: async (): Promise<Uint8Array> => {
        await this.initializeWasm()
        const resvg = new Resvg(this.svgContent, {
          background: 'transparent',
          fitTo: {
            mode: 'original',
          },
        })
        const pngData = resvg.render().asPng()
        return pngData
      },
    }
  }
}
