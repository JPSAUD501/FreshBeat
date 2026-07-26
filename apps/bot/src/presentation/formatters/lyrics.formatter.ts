import type { Lyrics } from '../../domain/entities/lyrics.js'

/** Telegram aceita até 4096 chars por mensagem; deixamos margem. */
const MAX_MESSAGE_CHARS = 4000

/**
 * Divide um texto em páginas respeitando quebras de linha.
 * Nunca corta uma linha no meio (a menos que ela sozinha estoure o limite).
 */
export function paginate(text: string, maxChars: number = MAX_MESSAGE_CHARS): string[] {
  const lines = text.split('\n')
  const pages: string[] = []
  let current = ''

  for (const line of lines) {
    const candidate = current === '' ? line : `${current}\n${line}`
    if (candidate.length > maxChars && current !== '') {
      pages.push(current)
      current = line
    } else {
      current = candidate
    }
  }
  if (current !== '') pages.push(current)
  return pages
}

/** Cabeçalho padrão das mensagens de letra. */
export function lyricsHeader(lyrics: Lyrics): string {
  return `🎵 <b>${escapeHtml(lyrics.trackName)}</b> — ${escapeHtml(lyrics.artistName)}`
}

/** Rodapé com a fonte (e selo de tradução automática quando for o caso). */
export function lyricsFooter(labels: { source: string; autoTranslated?: string }): string {
  const parts = [labels.source]
  if (labels.autoTranslated !== undefined) parts.unshift(labels.autoTranslated)
  return `<i>${escapeHtml(parts.join(' · '))}</i>`
}

/** Escapa o mínimo para HTML do Telegram. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
