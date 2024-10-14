import { Bot } from 'grammy'
import type { BotCommand } from './types.ts'

const commands: BotCommand[] = []

export function registerCommand(command: BotCommand) {
  commands.push(command)
}

export function setupCommands(bot: Bot) {
  for (const command of commands) {
    bot.command(command.name, command.execute)
  }
  bot.api.setMyCommands(commands.map((cmd) => ({ command: cmd.name, description: cmd.description('en') })))
}

export function getCommandList(): { command: string; description: (langCode: string | undefined) => string }[] {
  return commands.map((cmd) => ({
    command: cmd.name,
    description: cmd.description,
  }))
}
