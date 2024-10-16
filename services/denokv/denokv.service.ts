/// <reference lib="deno.unstable" />
const kv = await Deno.openKv('https://api.deno.com/databases/a43958ed-66d3-4fbb-8983-1bdb9337e389/connect')

export class DenoKVService {
  getClient(): Deno.Kv {
    return kv
  }
}
