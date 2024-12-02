import { LyricsData, LyricsProvider, LyricsSearchRequest } from '../lyrics.dto.ts'
import { JSDOM } from 'jsdom'

export class GoogleService {
  private readonly provider: LyricsProvider = {
    name: 'Google',
    url: 'https://www.google.com/',
  }

  private requestOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
    },
  }

  async search(props: LyricsSearchRequest): Promise<LyricsData> {
    const query = `lyrics ${props.track} ${props.artist}`
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    const response = await fetch(`${searchUrl}&lr=lang_en`, this.requestOptions)
    const data = await response.text()
    const dom = new JSDOM(data)
    const document = dom.window.document
    const lyricsElement = document.querySelector('.hwc .BNeawe.tAd8D.AP7Wnd')
    const lyrics = lyricsElement ? lyricsElement.textContent.trim() : ''
    const sourceElement = document.querySelector('.hwc .BNeawe.uEec3.AP7Wnd a')
    const source = sourceElement ? sourceElement.textContent.trim() : ''
    const composersElements = document.querySelectorAll('.hwc .BNeawe.uEec3.AP7Wnd')
    let composers = ''
    if (composersElements.length > 1) {
      let composersText = composersElements[1].textContent.trim()
      const colonIndex = composersText.indexOf(':')
      if (colonIndex !== -1) {
        composersText = composersText.substring(colonIndex + 1).trim()
      }
      const infoIndex = composersText.search(/[.\n]/)
      if (infoIndex !== -1) {
        composersText = composersText.substring(0, infoIndex).trim()
      }
      composers = composersText
    }
    return {
      lyrics,
      composers,
      url: searchUrl,
      provider: {
        name: `${this.provider} (${source})`,
        url: searchUrl,
      },
    }
  }
}
