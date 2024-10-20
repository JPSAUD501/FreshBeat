import { crypto } from '@std/crypto'

class Auth {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
  ) {}

  async getSignature(props: {
    parameters: Record<string, string>
  }): Promise<string> {
    const keys = Object.keys(props.parameters).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    const excludedKeys = ['format', 'callback']
    const filteredKeys = keys.filter((key) => !excludedKeys.includes(key))
    const parameterString = filteredKeys.map((key) => `${key}${props.parameters[key]}`).join('')
    const preHashSignature = `${parameterString}${this.apiSecret}`
    console.log(preHashSignature)
    const hashBuffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(preHashSignature))
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
    return signature
  }

  async createSession(props: {
    token: string
  }) {
    const parameters = {
      api_key: this.apiKey,
      method: 'auth.getSession',
      token: props.token,
    }
    const apiSig = await this.getSignature({ parameters })
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    console.log(queryParameters)
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${queryParameters}&format=json&api_sig=${apiSig}`)
    const data = await response.json()
    console.log(data)
    return data
  }
}

export class LastFmService {
  private readonly apiKey: string
  private readonly apiSecret: string
  readonly auth: Auth

  constructor(props: { apiKey: string; apiSecret: string }) {
    this.apiKey = props.apiKey
    this.apiSecret = props.apiSecret
    this.auth = new Auth(this.apiKey, this.apiSecret)
  }
}
