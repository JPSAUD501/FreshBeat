/** Idiomas suportados pelo FreshBeat. pt-BR é a base e o fallback final. */
export const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'ja-JP', 'es-ES'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'pt-BR'

/**
 * Descritor de mensagem: a chave estável + o texto pt-BR padrão
 * (que vive inline no código e serve de fallback imediato).
 */
export interface MessageDescriptor {
  readonly key: string
  /** Texto padrão em pt-BR, com placeholders {{var}} quando aplicável. */
  readonly value: string
}

/** Define uma mensagem. Usar sempre via `msg({ key, value })`. */
export function msg(descriptor: MessageDescriptor): MessageDescriptor {
  return descriptor
}

export type Messages = Record<string, string>
