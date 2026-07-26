/** Imagem gerada por IA, pronta para upload. */
export interface GeneratedImage {
  bytes: Uint8Array
  contentType: string
}

/**
 * Port de geração de imagens a partir de um prompt textual.
 * Implementação: Replicate (z-image-turbo).
 */
export interface ImageGenerator {
  generate(input: { prompt: string }): Promise<GeneratedImage>
}
