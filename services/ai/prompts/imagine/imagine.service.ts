import * as ai from 'ai'
import { outputSchema, systemPrompt } from './prompt.ts'

export class Imagine {
  constructor(
    private readonly model: ai.LanguageModelV1,
  ) {}

  async lyricsImage(lyrics: string) {
    const response = await ai.generateObject({
      model: this.model,
      system: systemPrompt,
      prompt: lyrics,
      schema: outputSchema,
      maxTokens: 2500,
    })
    return response.object
  }
}
