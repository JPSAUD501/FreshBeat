import { describe, expect, it } from 'vitest'
import { LrcmuxProvider } from './lrcmux.provider.js'
import { LrclibProvider } from './lrclib.provider.js'
import { LyricsOvhProvider } from './lyrics-ovh.provider.js'

/**
 * Testes de integração — batem nas APIs REAIS de letras.
 * Não precisam de chaves, só de rede. Rodam via `npm run test:integration`.
 */
describe('lyrics providers (integração real)', () => {
  const track = { name: 'Bohemian Rhapsody', artist: 'Queen' }

  it('lrcmux encontra Bohemian Rhapsody', async () => {
    const lyrics = await new LrcmuxProvider().search(track)
    expect(lyrics).not.toBeNull()
    expect(lyrics?.plainLyrics.length).toBeGreaterThan(100)
  })

  it('LRCLIB encontra Bohemian Rhapsody', async () => {
    const lyrics = await new LrclibProvider().search(track)
    expect(lyrics).not.toBeNull()
    expect(lyrics?.plainLyrics).toContain('real life')
  })

  it('lyrics.ovh encontra Yellow do Coldplay', async () => {
    const lyrics = await new LyricsOvhProvider().search({ name: 'Yellow', artist: 'Coldplay' })
    expect(lyrics).not.toBeNull()
    expect(lyrics?.plainLyrics).toContain('Look at the stars')
  })

  it('provedores retornam null para música inexistente', async () => {
    const ghost = { name: 'musicaquenaoexiste12345', artist: 'artistaquenaoexiste67890' }
    await expect(new LrcmuxProvider().search(ghost)).resolves.toBeNull()
    await expect(new LrclibProvider().search(ghost)).resolves.toBeNull()
    await expect(new LyricsOvhProvider().search(ghost)).resolves.toBeNull()
  })
})
