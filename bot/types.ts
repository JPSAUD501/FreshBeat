export type BotCommand = {
  name: string
  description: (langCode: string | undefined) => string
}

export type BotConfig = {
  domain: string
}
