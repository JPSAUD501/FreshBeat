import * as ai from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { config } from '../../config.ts'
import { Imagine } from './prompts/imagine/imagine.service.ts'
import { Explain } from './prompts/explain/explain.service.ts'

const openrouterProvider = createOpenRouter({
  apiKey: config.OPENROUTER_API_KEY,
  compatibility: 'strict',
})

export class AiService {
  readonly imagine: Imagine
  readonly explain: Explain
  private readonly model: ai.LanguageModel

  constructor(
    private readonly modelId: string,
  ) {
    this.model = openrouterProvider.chat(this.modelId)
    this.explain = new Explain(this.model)
    this.imagine = new Imagine(this.model)
  }

  async simpleAnswer(question: string) {
    const response = await ai.generateText({
      model: this.model,
      prompt: question,
      maxOutputTokens: 500,
    })
    return response.text
  }
}
