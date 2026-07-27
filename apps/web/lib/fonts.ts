import { Anton, Inter } from 'next/font/google'

// Display condensado (títulos gigantes, estilo editorial) + corpo legível.
// ja-JP cai para a stack CJK do sistema definida em --font-display/--font-sans.
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

/** Classes de variável CSS para aplicar no <html> dos dois root layouts. */
export const fontVariables = `${anton.variable} ${inter.variable}`
