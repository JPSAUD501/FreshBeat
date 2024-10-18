/// <reference lib="deno.unstable" />
export class DenoKVService {
  private readonly kvPromise = Deno.openKv('https://api.deno.com/databases/a43958ed-66d3-4fbb-8983-1bdb9337e389/connect')

  async getClient(): Promise<Deno.Kv> {
    return await this.kvPromise
  }
}
