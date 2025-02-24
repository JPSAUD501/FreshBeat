import { LyricsData, LyricsSearchRequest } from '../lyrics.dto.ts'
import { OvhSearchSuggestionsRequest, OvhSearchSuggestionsResponse, OvhSearchSuggestionsResponseSchema, OvhGetLyricsRequest, OvhGetLyricsResponse, OvhGetLyricsResponseSchema } from './lyricsovh.dto.ts'

export class LyricsOvhService {
	private readonly provider = {
		name: 'Lyrics.ovh',
		url: 'https://lyrics.ovh/'
	}

	private async searchSuggestions(props: OvhSearchSuggestionsRequest): Promise<OvhSearchSuggestionsResponse> {
		const query = `${props.title} ${props.artist}`
		const url = `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`
    const response = await fetch(url)
    const responseJson = await response.json()
    const parsedResponse = OvhSearchSuggestionsResponseSchema.parse(responseJson)
    return parsedResponse
	}

	private async getLyrics(props: OvhGetLyricsRequest): Promise<OvhGetLyricsResponse> {
		const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(props.lyricArtist)}/${encodeURIComponent(props.lyricTitle)}`
    const response = await fetch(url)
    const responseJson = await response.json()
    const parsedResponse = OvhGetLyricsResponseSchema.parse(responseJson)
		const parsedLyrics = parsedResponse.lyrics.replace(/\n\n/g, '\n')
		return { lyrics: parsedLyrics }
	}

	async search(props: LyricsSearchRequest): Promise<LyricsData> {
		const suggestResult = await this.searchSuggestions({ title: props.track, artist: props.artist })
    if (suggestResult.data.length <= 0) {
      throw new Error('No lyrics found')
    }
		const firstItem = suggestResult.data[0]
		const lyricsResponse = await this.getLyrics({ lyricArtist: firstItem.artist.name, lyricTitle: firstItem.title })
		return {
			lyrics: lyricsResponse.lyrics,
			composers: '',
			url: 'https://lyrics.ovh/',
			provider: {
				name: this.provider.name,
				url: this.provider.url,
			}
		}
	}
}
