import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../../config.ts'

export class SupabaseService {
  private readonly client: SupabaseClient

  constructor() {
    this.client = createClient(config.SUPABASE_CLIENT_URL, config.SUPABASE_CLIENT_SECRET)
  }

  async uploadFile(bucketName: string, path: string, file: ArrayBuffer) {
    const { error } = await this.client.storage.from(bucketName).upload(path, file)
    if (error) {
      throw new Error(`Upload error: ${error.message}`)
    }
  }

  async downloadFile(bucketName: string, path: string): Promise<ArrayBuffer> {
    const { data, error } = await this.client.storage.from(bucketName).download(path)
    if (error || !data) {
      throw new Error(`Download error: ${error?.message}`)
    }
    const arrayBuffer = await data.arrayBuffer()
    return arrayBuffer
  }

  async deleteFile(bucketName: string, path: string) {
    const { error } = await this.client.storage.from(bucketName).remove([path])
    if (error) {
      throw new Error(`Delete error: ${error.message}`)
    }
  }
}