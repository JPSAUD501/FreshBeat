import { Search } from '../search/search.service.ts'
import { Auth } from '../auth/auth.service.ts'
import { SoundcloudPreviewFromResponse } from './preview.dto.ts'
import z from 'zod'
import { SearchTrackRequest } from '../search/search.dto.ts'

export class Preview {
  constructor(private readonly search: Search, private readonly auth: Auth) {}

  async from(props: SearchTrackRequest): Promise<SoundcloudPreviewFromResponse> {
    const scTrack = await this.search.track(props)
    if (scTrack.collection.length === 0) {
      throw new Error('Track not found')
    }
    const track = scTrack.collection[0]
    if (!track.media || track.media.transcodings.length === 0) {
      throw new Error('Track media or transcodings not found')
    }
    const clientId = await this.auth.getClientId()
    const mediaUrl = track.media.transcodings[0].url
    const m3u8Url = await this.fetchAndParseMediaUrl(mediaUrl, clientId, props)
    const m3u8Response = await this.fetchM3u8Url(m3u8Url)
    const m3u8Parts = this.parseM3u8Response(m3u8Response, props)
    if (m3u8Parts.length === 0) {
      throw new Error('No parts found in m3u8')
    }
    const previewUrl = this.getPreviewUrl(m3u8Parts)
    return { partialPreviewUrl: previewUrl }
  }

  private async fetchAndParseMediaUrl(mediaUrl: string, clientId: string, props: SearchTrackRequest): Promise<string> {
    const response = await fetch(`${mediaUrl}?client_id=${clientId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch media URL')
    }
    const responseData = await response.json()
    const schema = z.object({ url: z.string() })
    const parsed = schema.safeParse(responseData)
    if (!parsed.success) {
      throw new Error(JSON.stringify({
        message: 'Error parsing response',
        errors: parsed.error.formErrors,
        receivedData: responseData,
        requestParameters: props,
      }, null, 2))
    }
    return parsed.data.url
  }

  private async fetchM3u8Url(m3u8Url: string): Promise<string> {
    const response = await fetch(m3u8Url)
    if (!response.ok) {
      throw new Error('Failed to fetch m3u8 URL')
    }
    return response.text()
  }

  private parseM3u8Response(m3u8Response: string, props: SearchTrackRequest): Array<{ duration: number, url: string }> {
    const schema = z.string()
    const parsed = schema.safeParse(m3u8Response)
    if (!parsed.success) {
      throw new Error(JSON.stringify({
        message: 'Error parsing response',
        errors: parsed.error.formErrors,
        receivedData: m3u8Response,
        requestParameters: props,
      }, null, 2))
    }

    const m3u8Lines = parsed.data.split('\n')
    const m3u8Parts: Array<{ duration: number, url: string }> = []
    for (let i = 0; i < m3u8Lines.length; i++) {
      if (m3u8Lines[i].startsWith('#EXTINF:')) {
        const duration = Number(m3u8Lines[i].split('#EXTINF:')[1].split(',')[0])
        const url = m3u8Lines[i + 1]
        m3u8Parts.push({ duration, url })
      }
    }
    return m3u8Parts
  }

  private getPreviewUrl(m3u8Parts: Array<{ duration: number, url: string }>): string {
    const previewMaxDuration = 30
    const fullMediaDuration = m3u8Parts.reduce((acc, cur) => acc + cur.duration, 0)
    const fullMediaMiddleIndex = Math.floor(fullMediaDuration / 2)
    const previewStartIndex = Math.max(0, fullMediaMiddleIndex - (previewMaxDuration / 2))
    const fullMediaParsedParts: Array<{ start: number, duration: number, url: string }> = []
    let accumulatedDuration = 0
    for (const part of m3u8Parts) {
      fullMediaParsedParts.push({
        start: accumulatedDuration,
        duration: part.duration,
        url: part.url
      })
      accumulatedDuration += part.duration
    }
    const previewParts = fullMediaParsedParts.filter(part => 
      part.start >= previewStartIndex && part.start <= previewStartIndex + previewMaxDuration
    )
    const longestPreviewPart = previewParts.reduce((acc, cur) => acc.duration > cur.duration ? acc : cur)
    return longestPreviewPart.url
  }
}
