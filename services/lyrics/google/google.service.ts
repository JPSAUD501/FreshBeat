import { LyricsData, LyricsProvider, LyricsSearchRequest } from '../lyrics.dto.ts'
import { GoogleLyricsSchema } from './google.dto.ts'
import { Google } from '@flytri/lyrics-finder'

export class GoogleService {
  private readonly provider: LyricsProvider = {
    name: 'Google',
    url: 'https://www.google.com/',
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const lyrics = await Google(`${props.track} ${props.artist}`)
    const parsed = GoogleLyricsSchema.parse(lyrics)
    return {
      lyrics: parsed.lyrics,
      url: `https://www.google.com/search?q=${encodeURIComponent(`lyrics ${props.track} ${props.artist}`)}`,
      provider: this.provider,
    }
  }
}
