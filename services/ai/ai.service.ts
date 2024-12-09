import * as ai from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { config } from '../../config.ts'
import { Imagine } from './prompts/imagine/imagine.service.ts'
import { Explain } from './prompts/explain/explain.service.ts'

const modelIds = {
  'gpt-4o-mini': 'openai',
  'gpt-4o': 'openai',
  'claude-3-5-haiku-latest': 'anthropic',
}
type ModelId = keyof typeof modelIds

export class AiService {
  readonly imagine: Imagine
  readonly explain: Explain
  private readonly model: ai.LanguageModelV1


  constructor(
    private readonly modelId: ModelId,
  ) {
    const openai = createOpenAI({
      apiKey: config.OPENAI_API_KEY,
    })
    const anthropic = createAnthropic({
      apiKey: config.ANTHROPIC_API_KEY,
    })

    switch (true) {
      case (modelIds[this.modelId] === 'openai'): {
        this.model = openai.languageModel(this.modelId)
        break
      }
      case (modelIds[this.modelId] === 'anthropic'): {
        this.model = anthropic.languageModel(this.modelId)
        break
      }
      default: {
        throw new Error(`Model ${this.modelId} not found`)
      }
    }
    this.explain = new Explain(this.model)
    this.imagine = new Imagine(this.model)
  }

  async simpleAnswer(question: string) {
    const response = await ai.generateText({
      model: this.model,
      prompt: question,
      maxTokens: 500,
    })
    return response.text
  }
}
