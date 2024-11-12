import { Musixmatch } from '@flytri/lyrics-finder'
import { MusixmatchLyricsSchema } from './musixmatch.dto.ts'
import { LyricsData, LyricsProvider, LyricsSearchRequest } from '../lyrics.dto.ts'

export class MusixmatchService {
  private readonly provider: LyricsProvider = {
    name: 'Musixmatch',
    url: 'https://www.musixmatch.com/',
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const lyrics = await Musixmatch(`${props.track} ${props.artist}`)
    const parsed = MusixmatchLyricsSchema.parse(lyrics)
    return {
      lyrics: parsed.lyrics,
      url: `https://www.musixmatch.com/search/${encodeURIComponent(`${props.track} ${props.artist}`)}`,
      provider: this.provider,
    }
  }
}
