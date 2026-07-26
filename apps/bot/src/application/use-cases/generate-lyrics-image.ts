import { createHash } from 'node:crypto'
import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { ImageGenerator } from '../../domain/ports/image-generator.js'
import type { ImageStorage } from '../../domain/ports/image-storage.js'

/** Imagens ficam em cache (a URL pública) por 30 dias. */
const IMAGE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60

export interface LyricsImage {
  /** URL pública da imagem no object storage. */
  url: string
}

/**
 * Gera a imagem da música a partir do prompt visual (vindo do
 * ExplainLyricsUseCase), faz upload no storage e cacheia a URL —
 * geração de imagem é cara, nunca repetimos para a mesma faixa.
 */
export class GenerateLyricsImageUseCase {
  constructor(
    private readonly imageGenerator: ImageGenerator,
    private readonly imageStorage: ImageStorage,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { lyrics: Lyrics; imagePrompt: string }): Promise<LyricsImage> {
    const { lyrics, imagePrompt } = input
    const key = cacheKey('lyrics-image', lyrics.artistName, lyrics.trackName)

    return getOrSet(this.cache, key, IMAGE_CACHE_TTL_SECONDS, async () => {
      const image = await this.imageGenerator.generate({ prompt: imagePrompt })
      const extension = image.contentType === 'image/png' ? 'png' : 'jpg'
      const objectKey = `lyrics/${objectKeyFor(lyrics)}.${extension}`
      const url = await this.imageStorage.upload({
        key: objectKey,
        bytes: image.bytes,
        contentType: image.contentType,
      })
      return { url }
    })
  }
}

/** Nome de objeto estável e único por faixa (hash evita colisões de slug). */
function objectKeyFor(lyrics: Lyrics): string {
  const slug = `${lyrics.artistName}-${lyrics.trackName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const hash = createHash('sha256')
    .update(`${lyrics.artistName}:${lyrics.trackName}`)
    .digest('hex')
    .slice(0, 12)
  return `${slug}-${hash}`
}
