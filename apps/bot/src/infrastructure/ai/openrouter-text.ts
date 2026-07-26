import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import type { AiTextGenerator } from '../../domain/ports/ai-text.js'

interface OpenRouterTextOptions {
  apiKey: string
  model: string
}

/**
 * OpenRouter (https://openrouter.ai) via Vercel AI SDK — chat completions
 * para tarefas de texto (tradução, explicação, prompts de imagem, alt-text).
 * Uma instância por modelo; o modelo é configurável por env.
 */
export class OpenRouterTextGenerator implements AiTextGenerator {
  private readonly openrouter

  constructor(private readonly options: OpenRouterTextOptions) {
    this.openrouter = createOpenRouter({ apiKey: options.apiKey })
  }

  async generate(input: { systemPrompt: string; userPrompt: string }): Promise<string> {
    const { text } = await generateText({
      model: this.openrouter(this.options.model),
      system: input.systemPrompt,
      prompt: input.userPrompt,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(60_000),
    })

    const content = text.trim()
    if (content === '') {
      throw new Error('OpenRouter retornou resposta vazia')
    }
    return content
  }
}
