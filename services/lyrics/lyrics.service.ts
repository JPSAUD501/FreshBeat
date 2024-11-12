import { GoogleService } from './google/google.service.ts'
import { LyricsData, LyricsSearchRequest } from './lyrics.dto.ts'
import { MusixmatchService } from './musixmatch/musixmatch.service.ts'

export class LyricsService {
  readonly google: GoogleService
  readonly musixmatch: MusixmatchService

  constructor() {
    this.google = new GoogleService()
    this.musixmatch = new MusixmatchService()
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const providers = [this.google, this.musixmatch]
    const promises = providers.map((provider) => provider.search(props))
    const result = await Promise.race(promises)
    return result
  }
}
