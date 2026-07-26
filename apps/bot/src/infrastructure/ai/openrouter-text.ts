import { z } from 'zod'
import type { AiTextGenerator } from '../../domain/ports/ai-text.js'

const chatCompletionResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
})

interface OpenRouterTextOptions {
  apiKey: string
  model: string
}

/**
 * OpenRouter (https://openrouter.ai) — chat completions para tarefas
 * de texto simples (tradução). Modelo configurável por env.
 */
export class OpenRouterTextGenerator implements AiTextGenerator {
  constructor(private readonly options: OpenRouterTextOptions) {}

  async generate(input: { systemPrompt: string; userPrompt: string }): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'FreshBeat/0.1 (https://github.com/JPSAUD501/FreshBeat)',
      },
      body: JSON.stringify({
        model: this.options.model,
        messages: [
          { role: 'system', content: input.systemPrompt },
          { role: 'user', content: input.userPrompt },
        ],
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter respondeu HTTP ${response.status}`)
    }

    const body = chatCompletionResponseSchema.parse(await response.json())
    const content = body.choices[0]?.message.content.trim()
    if (content === undefined || content === '') {
      throw new Error('OpenRouter retornou resposta vazia')
    }
    return content
  }
}
