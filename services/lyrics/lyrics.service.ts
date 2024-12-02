import { GoogleService } from './google/google.service.ts'
import { LyricsData, LyricsSearchRequest } from './lyrics.dto.ts'

export class LyricsService {
  readonly google: GoogleService

  constructor() {
    this.google = new GoogleService()
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const providers = [this.google]
    const promises = providers.map((provider) => provider.search(props))
    const result = await Promise.race(promises)
    return result
  }
}
