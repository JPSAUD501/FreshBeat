import { crypto } from '@std/crypto'
import { type LastFmAuthCreateSessionRequest, type LastFmAuthCreateSessionResponse, LastFmAuthCreateSessionResponseSchema, type LastFmAuthGetSignatureRequest, type LastFmAuthGetSignatureResponse } from './auth.dto.ts'

export class Auth {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
  ) {}

  async getSignature(props: LastFmAuthGetSignatureRequest): Promise<LastFmAuthGetSignatureResponse> {
    const keys = Object.keys(props.parameters).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    const excludedKeys = ['format', 'callback']
    const filteredKeys = keys.filter((key) => !excludedKeys.includes(key))
    const parameterString = filteredKeys.map((key) => `${key}${props.parameters[key]}`).join('')
    const preHashSignature = `${parameterString}${this.apiSecret}`
    console.log(preHashSignature)
    const hashBuffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(preHashSignature))
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
    return { signature }
  }

  async createSession(props: LastFmAuthCreateSessionRequest): Promise<LastFmAuthCreateSessionResponse> {
    const method = 'auth.getSession'
    const parameters = {
      api_key: this.apiKey,
      token: props.token,
      method,
    }
    const apiSig = await this.getSignature({ parameters })
    const queryParameters = new URLSearchParams({
      ...parameters,
    }).toString()
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&api_sig=${apiSig.signature}&${queryParameters}`)
    const data = await response.json()
    const parsedData = LastFmAuthCreateSessionResponseSchema.safeParse(data)
    if (!parsedData.success) {
      throw new Error(JSON.stringify({
        message: 'Error parsing response',
        errors: parsedData.error.formErrors,
        receivedData: data,
        requestParameters: parameters,
      }, null, 2))
    }
    return data
  }
}
