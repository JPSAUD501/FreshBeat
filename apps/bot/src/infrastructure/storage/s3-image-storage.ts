import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { ImageStorage } from '../../domain/ports/image-storage.js'

export interface S3ImageStorageOptions {
  endpoint: string
  region: string
  bucket: string
  accessKey: string
  secretKey: string
  /** URL pública base do bucket (ex.: https://cdn.exemplo.com). */
  publicUrl: string
}

/** Adapter S3 compatível (AWS, Cloudflare R2, MinIO…) para imagens públicas. */
export class S3ImageStorage implements ImageStorage {
  private readonly client: S3Client

  constructor(private readonly options: S3ImageStorageOptions) {
    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      credentials: { accessKeyId: options.accessKey, secretAccessKey: options.secretKey },
      forcePathStyle: true,
    })
  }

  async upload(input: { key: string; bytes: Uint8Array; contentType: string }): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: input.key,
        Body: input.bytes,
        ContentType: input.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
    return `${this.options.publicUrl.replace(/\/+$/, '')}/${input.key}`
  }
}
