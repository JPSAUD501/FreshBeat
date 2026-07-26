import { cacheKey, getOrSet, type CacheStore } from '@freshbeat/cache'
import type { Locale } from '@freshbeat/i18n'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { AiTextGenerator } from '../../domain/ports/ai-text.js'
import { LANGUAGE_NAMES } from '../language-names.js'

/** Explicações ficam em cache por 30 dias. */
const EXPLANATION_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Protege o prompt de letras gigantescas. */
const MAX_LYRICS_CHARS = 8000

export interface LyricsExplanation {
  /** Explicação do significado, no idioma do usuário. */
  explanation: string
  /** Prompt visual (em inglês) para gerar a imagem da música. */
  imagePrompt: string
  /** Alt-text acessível da imagem, no idioma do usuário. */
  altText: string
}

export interface ExplainLyricsGenerators {
  /** Gera o prompt visual a partir da letra. */
  imageDescriber: AiTextGenerator
  /** Escreve a explicação ("crítico musical descontraído"). */
  explainer: AiTextGenerator
  /** Resume o prompt visual em alt-text acessível. */
  altTextWriter: AiTextGenerator
}

// Prompts adaptados do MelodyScout (api/msOpenRouterApi/base.ts)
const IMAGE_PROMPT_SYSTEM = `You are an AI image generation assistant. Your task is to convert song lyrics into a detailed and visually compelling image generation prompt.
Rules:
- Capture the mood, themes and imagery of the song. The image must NOT contain any text or letters.
- Format: [main subject/scene], [art style], [composition and lighting], [color palette and mood].
- Output a single cohesive paragraph with at most 2000 characters.
- Output ONLY the prompt, always in English.`

const EXPLANATION_SYSTEM = `You are a creative and relaxed music critic who loves talking about music.
Explain the meaning of the song to the listener in a friendly, conversational tone, inspired by the themes and imagery of the lyrics.
Rules:
- Response language: {{language}}.
- A single concise paragraph (no more than 5 sentences).
- Conclude with plenty of relevant emojis.
- No markdown, no headings, no lists.`

const ALT_TEXT_SYSTEM = `You are an assistant that writes concise and clear alt text for AI-generated images, helping people with visual impairments.
Given the detailed description used to generate the image, summarize what the image shows.
Rules:
- Response language: {{language}}.
- One or two short sentences.
- No markdown, no quotes.`

/** Remove timestamps LRC ([mm:ss.xx]) que alguns provedores deixam no texto. */
export function stripLrcTags(text: string): string {
  return text
    .replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\][^\S\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Explica o significado de uma letra no idioma do usuário e produz,
 * junto, o prompt visual da imagem e o alt-text acessível — tudo em
 * uma única chamada cacheada (evita 3 chamadas de IA por clique).
 */
export class ExplainLyricsUseCase {
  constructor(
    private readonly generators: ExplainLyricsGenerators,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: { lyrics: Lyrics; locale: Locale }): Promise<LyricsExplanation> {
    const { lyrics, locale } = input
    const key = cacheKey('lyrics-explanation', lyrics.artistName, lyrics.trackName, locale)

    return getOrSet(this.cache, key, EXPLANATION_CACHE_TTL_SECONDS, async () => {
      const language = LANGUAGE_NAMES[locale]
      const text = stripLrcTags(lyrics.plainLyrics).slice(0, MAX_LYRICS_CHARS)
      const song = `"${lyrics.trackName}" by ${lyrics.artistName}`

      // 1) Prompt visual (sempre em inglês — modelos de imagem respondem melhor)
      const imagePrompt = await this.generators.imageDescriber.generate({
        systemPrompt: IMAGE_PROMPT_SYSTEM,
        userPrompt: `Song: ${song}\n\nLyrics:\n${text}`,
      })

      // 2) Explicação no idioma do usuário, enriquecida pela visão da imagem
      const explanation = await this.generators.explainer.generate({
        systemPrompt: EXPLANATION_SYSTEM.replace('{{language}}', language),
        userPrompt: `Song: ${song}\n\nLyrics:\n${text}\n\nVisual interpretation of the song:\n${imagePrompt}`,
      })

      // 3) Alt-text acessível a partir do prompt visual
      const altText = await this.generators.altTextWriter.generate({
        systemPrompt: ALT_TEXT_SYSTEM.replace('{{language}}', language),
        userPrompt: imagePrompt,
      })

      return { explanation, imagePrompt, altText }
    })
  }
}
