import Replicate from 'replicate'
import type { GeneratedImage, ImageGenerator } from '../../domain/ports/image-generator.js'

/**
 * Modelo padrão: p-image (Pruna AI) — rápido e barato.
 * Sobrescrevível no construtor (o container injeta REPLICATE_IMAGE_MODEL).
 */
const DEFAULT_MODEL = 'prunaai/p-image'

/** Respostas possíveis do SDK do Replicate (FileOutput, URL ou lista deles). */
type ReplicateOutput = unknown

interface ReplicateImageOptions {
  apiToken: string
  model?: `${string}/${string}`
}

/** Adapter Replicate para geração de imagens por prompt. */
export class ReplicateImageGenerator implements ImageGenerator {
  private readonly replicate: Replicate
  private readonly model: string

  constructor(options: ReplicateImageOptions) {
    this.replicate = new Replicate({ auth: options.apiToken })
    this.model = options.model ?? DEFAULT_MODEL
  }

  async generate(input: { prompt: string }): Promise<GeneratedImage> {
    const output: ReplicateOutput = await this.replicate.run(this.model as `${string}/${string}`, {
      input: { prompt: input.prompt },
    })

    const bytes = await outputToBytes(output)
    return { bytes, contentType: detectContentType(bytes) }
  }
}

async function outputToBytes(output: ReplicateOutput): Promise<Uint8Array> {
  const first = Array.isArray(output) ? (output[0] as unknown) : output

  // SDK novo: FileOutput com .blob()
  if (typeof first === 'object' && first !== null && 'blob' in first) {
    const blob = await (first as { blob: () => Promise<Blob> }).blob()
    return new Uint8Array(await blob.arrayBuffer())
  }

  // SDK antigo / modelos que retornam URL
  if (typeof first === 'string' && first.startsWith('http')) {
    const response = await fetch(first, { signal: AbortSignal.timeout(60_000) })
    if (!response.ok) throw new Error(`Falha ao baixar imagem: HTTP ${response.status}`)
    return new Uint8Array(await response.arrayBuffer())
  }

  throw new Error('Replicate retornou um formato de imagem inesperado')
}

/** Detecta o formato pelos magic bytes (PNG/JPEG/WebP), default JPEG. */
function detectContentType(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png'
  if (bytes[0] === 0x52 && bytes[1] === 0x49) return 'image/webp'
  return 'image/jpeg'
}
