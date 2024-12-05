import * as ai from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { config } from '../../config.ts'
import { Imagine } from './prompts/imagine/imagine.service.ts'
import { Explain } from './prompts/explain/explain.service.ts'

export class AiService {
  readonly imagine: Imagine
  readonly explain: Explain
  private readonly model: ai.LanguageModelV1

  constructor(
    private readonly modelId: string,
  ) {
    const openai = createOpenAI({
      apiKey: config.OPENAI_API_KEY,
    })
    const anthropic = createAnthropic({
      apiKey: config.ANTHROPIC_API_KEY,
    })
    const modelIds = {
      openai: [
        'gpt-4o-mini',
        'gpt-4o',
      ],
      anthropic: [
        'claude-3-5-haiku-latest',
      ],
    }
    switch (true) {
      case (modelIds.openai.includes(this.modelId)): {
        this.model = openai.languageModel(this.modelId)
        break
      }
      case (modelIds.anthropic.includes(this.modelId)): {
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
