export type TelegramBotCommand = {
  name: string
  description: (langCode: string | undefined) => string
}

export type TelegramBotConfig = {
  domain: string
}
