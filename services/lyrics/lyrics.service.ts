import { GoogleService } from './google/google.service.ts'
import { LyricsData, LyricsSearchRequest } from './lyrics.dto.ts'
import { LyricsOvhService } from './lyricsovh/lyricsovh.service.ts'

export class LyricsService {
  readonly google: GoogleService
  readonly lyricsovh: LyricsOvhService

  constructor() {
    this.google = new GoogleService()
    this.lyricsovh = new LyricsOvhService()
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const providers = [this.google, this.lyricsovh]
    const promises = providers.map((provider) => provider.search(props).catch(() => null))
    const results = await Promise.all(promises)
    const result = results.find((result) => result !== null)
    if (result === undefined) {
      throw new Error('No lyrics found')
    }
    return result
  }
}
