import * as ai from 'ai'
import { outputSchema, systemPrompt } from './prompt.ts'

export class Explain {
  constructor(
    private readonly model: ai.LanguageModel,
  ) {}

  async lyrics(lyrics: string, imageDescription: string, outputLanguage: string) {
    const response = await ai.generateObject({
      model: this.model,
      system: systemPrompt,
      prompt: JSON.stringify(
        {
          lyrics,
          imageDescription,
          outputLanguage,
        },
        null,
        2,
      ),
      schema: outputSchema,
      maxOutputTokens: 2500,
    })
    return response.object
  }
}
