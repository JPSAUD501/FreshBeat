/// <reference lib="deno.unstable" />

import { config } from '../../config.ts'

export class DenoKVService {
  private readonly kvPromise = Deno.openKv(config.DENO_KV_URL)

  async getClient(): Promise<Deno.Kv> {
    return await this.kvPromise
  }
}
