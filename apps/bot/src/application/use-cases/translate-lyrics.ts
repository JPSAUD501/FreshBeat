import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Locale } from '@freshbeat/i18n'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { AiTextGenerator } from '../../domain/ports/ai-text.js'

/** Traduções ficam em cache por 30 dias. */
const TRANSLATION_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Protege o prompt de letras gigantescas. */
const MAX_LYRICS_CHARS = 8000

const LANGUAGE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Brazilian Portuguese',
  'en-US': 'English',
  'ja-JP': 'Japanese',
  'es-ES': 'Spanish',
}

const SYSTEM_PROMPT = `You are a professional song lyrics translator.
Translate the lyrics to the target language preserving the line structure exactly (one output line per input line).
Keep the emotion and meaning; do not transliterate unless asked.
Output ONLY the translated lyrics — no titles, no notes, no explanations.`

export class TranslateLyricsUseCase {
  constructor(
    private readonly ai: AiTextGenerator,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { lyrics: Lyrics; targetLocale: Locale }): Promise<string> {
    const { lyrics, targetLocale } = input
    const key = cacheKey('lyrics-translation', lyrics.artistName, lyrics.trackName, targetLocale)

    return getOrSet(this.cache, key, TRANSLATION_CACHE_TTL_SECONDS, async () => {
      const text = lyrics.plainLyrics.slice(0, MAX_LYRICS_CHARS)
      return this.ai.generate({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Target language: ${LANGUAGE_NAMES[targetLocale]}\n\n${text}`,
      })
    })
  }
}
