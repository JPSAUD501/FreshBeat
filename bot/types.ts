import { Context } from 'grammy'

export type MsgFabricOutput = {
  message: string
}

export interface BotCommand {
  name: string
  description: (langCode: string | undefined) => string
  execute: (ctx: Context) => Promise<void> | void
}

export interface BotCallback {
  execute: (ctx: Context) => Promise<void>
}
