import { Resvg, initWasm } from "npm:@resvg/resvg-wasm"
import jpeg from 'npm:jpeg-js'

export class HtmlConverter {
  private initialized = false
  private wasmUrl = "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm"
  private svgContent: string

  constructor(svgContent: string) {
    this.svgContent = svgContent
  }

  private async initializeWasm() {
    if (!this.initialized) {
      await initWasm(this.wasmUrl)
      this.initialized = true
    }
  }

  get to() {
    return {
      async jpeg(): Promise<Uint8Array> {
        await this.initializeWasm()
        const resvg = new Resvg(this.svgContent, {
          background: "white",
          fitTo: {
            mode: "width",
            value: 1000
          }
        })
        const image = resvg.render()
        const rgbaData = image.pixels // Uint8Array with RGBA data
        const width = image.width
        const height = image.height

        const rawImageData = {
          data: rgbaData,
          width,
          height
        }

        // Encode RGBA data to JPEG format
        const jpegImageData = jpeg.encode(rawImageData, 90) // Quality: 0-100
        return jpegImageData.data
      }
    }
  }
}
