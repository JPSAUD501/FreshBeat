import { S3 } from '@aws-sdk/client-s3'
import { config } from '../../config.ts'

export class S3Service {
  private readonly client: S3

  constructor() {
    this.client = new S3({
      endpoint: config.S3_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY,
        secretAccessKey: config.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    })
  }

  async uploadFile(bucketName: string, path: string, file: ArrayBuffer) {
    try {
      await this.client.putObject({
        Bucket: bucketName,
        Key: path,
        Body: new Uint8Array(file),
      })
    } catch (error) {
      throw new Error(`Upload error: ${(error as Error).message}`)
    }
  }

  async downloadFile(bucketName: string, path: string): Promise<ArrayBuffer> {
    try {
      const response = await this.client.getObject({
        Bucket: bucketName,
        Key: path,
      })
      if (!response.Body) {
        throw new Error('Empty response body')
      }
      const arrayBuffer = await response.Body.transformToByteArray()
      return arrayBuffer.buffer as ArrayBuffer
    } catch (error) {
      throw new Error(`Download error: ${(error as Error).message}`)
    }
  }

  async deleteFile(bucketName: string, path: string) {
    try {
      await this.client.deleteObject({
        Bucket: bucketName,
        Key: path,
      })
    } catch (error) {
      throw new Error(`Delete error: ${(error as Error).message}`)
    }
  }
}
