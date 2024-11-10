import { PromisePool } from '@supercharge/promise-pool'

export class Auth {
  async getClientId(): Promise<string> {
    const url = 'https://soundcloud.com/search?q=melodyscout+freshbeat'
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch SoundCloud API')
    const data = await response.text()
    const scriptSources = Array.from(data.matchAll(/<script crossorigin src="([^"]+)"/g), (m) => m[1])
    const scripts: string[] = []
    await PromisePool.withConcurrency(10).for(scriptSources).process(async (scriptSourceUrl) => {
      try {
        const scriptResponse = await fetch(scriptSourceUrl)
        if (!scriptResponse.ok) return
        const scriptData = await scriptResponse.text()
        scripts.push(scriptData)
      } catch (error) {
        console.error(`Failed to fetch script: ${scriptSourceUrl}`, error)
      }
    })
    const clientIdScript = scripts.find((script) => script.includes('client_id:"'))
    if (!clientIdScript) throw new Error('Client ID not found in scripts')
    const clientIdMatch = clientIdScript.match(/client_id:"([^"]+)"/)
    if (!clientIdMatch) throw new Error('Client ID not found in script content')
    return clientIdMatch[1]
  }
}
