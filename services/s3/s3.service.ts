import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { config } from '../../config.ts'

export class S3Service {
  private readonly client: S3Client

  constructor() {
    this.client = new S3Client({
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
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: new Uint8Array(file),
    })

    try {
      await this.client.send(command)
    } catch (error) {
      throw new Error(`Upload error: ${(error as Error).message}`)
    }
  }

  async downloadFile(bucketName: string, path: string): Promise<ArrayBuffer> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    })

    try {
      const response = await this.client.send(command)
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
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: path,
    })

    try {
      await this.client.send(command)
    } catch (error) {
      throw new Error(`Delete error: ${(error as Error).message}`)
    }
  }
}
