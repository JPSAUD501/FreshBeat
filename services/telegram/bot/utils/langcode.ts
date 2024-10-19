import type { Context } from 'grammy'

export function ctxLangCode(ctx: Context): string | undefined {
  return ctx.message?.from.language_code
}
