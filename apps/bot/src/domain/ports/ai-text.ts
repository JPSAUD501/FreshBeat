/**
 * Port de geração de texto por IA (tradução, explicação).
 * Implementação: OpenRouter via AI SDK / fetch.
 */
export interface AiTextGenerator {
  generate(input: { systemPrompt: string; userPrompt: string }): Promise<string>
}
