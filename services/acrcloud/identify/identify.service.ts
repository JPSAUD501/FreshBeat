import { IdentifyTrack, zodIdentifyTrack } from './identify.dto.ts'
import { crypto } from '@std/crypto'

export class Identify {
  private readonly BASE_URL = 'https://identify-us-west-2.acrcloud.com'
  private readonly ENDPOINT = '/v1/identify'
  private readonly METHOD = 'POST'

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
  ) {}

  private createSignatureParams() {
    return {
      method: this.METHOD,
      uri: this.ENDPOINT,
      accessKey: this.apiKey,
      dataType: 'audio',
      signatureVersion: '1',
      timestamp: Math.floor(Date.now() / 1000).toString(),
    }
  }

  private async generateSignature(params: ReturnType<typeof this.createSignatureParams>) {
    const signatureString = [
      params.method,
      params.uri,
      params.accessKey,
      params.dataType,
      params.signatureVersion,
      params.timestamp,
    ].join('\n')
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.apiSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signatureString),
    )
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
  }

  private createFormData(audio: Uint8Array, params: ReturnType<typeof this.createSignatureParams>, signature: string) {
    const form = new FormData()
    form.append('sample', new Blob([new Uint8Array(audio)]))
    form.append('sample_bytes', audio.length.toString())
    form.append('access_key', this.apiKey)
    form.append('data_type', params.dataType)
    form.append('signature_version', params.signatureVersion)
    form.append('signature', signature)
    form.append('timestamp', params.timestamp)
    return form
  }

  async track(audio: Uint8Array): Promise<IdentifyTrack> {
    const signatureParams = this.createSignatureParams()
    const signature = await this.generateSignature(signatureParams)
    const form = this.createFormData(audio, signatureParams, signature)
    const response = await fetch(`${this.BASE_URL}${this.ENDPOINT}`, {
      method: this.METHOD,
      body: form,
    })
    if (!response.ok) throw new Error('Failed to identify track')
    const data = await response.json()
    return zodIdentifyTrack.parse(data)
  }
}
