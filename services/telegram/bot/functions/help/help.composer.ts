import { Composer } from 'grammy'
import { lang } from '../../../../../localization/base.ts'
import type { TelegramBotCommand } from '../../types.ts'
import { ctxLangCode } from '../../utils/langcode.ts'
import { ErrorsService } from '../../../../errors/errors.service.ts'
import type { CustomContext } from '../../bot.service.ts'

export class HelpComposer {
  private readonly composerName = 'help'
  private readonly composer = new Composer<CustomContext>()

  constructor(
    private readonly errorsService: ErrorsService,
  ) {
    this.composer.command(
      'help',
      (ctx) => this.help(ctx).catch((error) => this.error(ctx, error)),
    )
    this.composer.callbackQuery(
      'help',
      (ctx) => this.help(ctx).catch((error) => this.error(ctx, error)),
    )
  }

  get() {
    return this.composer
  }

  async error(ctx: CustomContext, error: Error) {
    console.error(error)
    const dbError = await this.errorsService.create({ composer: this.composerName, ctx: JSON.stringify(ctx, null, 2), error: error.stack ?? error.message })
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'help_command_error_with_code', value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte e forneça o código de erro: {{error_id}}' }, { error_id: dbError.id.toString() }))
  }

  commands(): TelegramBotCommand[] {
    return [
      { name: 'help', description: (langCode: string | undefined) => lang(langCode, { key: 'help_command_description', value: 'Mostrar ajuda e informações sobre o bot.' }) },
    ]
  }

  async help(ctx: CustomContext) {
    if (ctx.callbackQuery !== undefined) {
      void ctx.answerCallbackQuery()
    }
    const commands = await ctx.api.getMyCommands({ language_code: lang(ctxLangCode(ctx), { key: 'two_letter_iso_lang_code', value: 'pt' }) as unknown as undefined })
    const replyArray = [
      lang(ctxLangCode(ctx), { key: 'help_command_description_text', value: 'Aqui está uma lista com os comandos disponíveis:' }),
    ]
    for (const command of commands) {
      replyArray.push(`<b>/${command.command}</b> - ${command.description}`)
    }
    const replyText = replyArray.join('\n')
    await ctx.reply(replyText, { parse_mode: 'HTML' })
  }
}
