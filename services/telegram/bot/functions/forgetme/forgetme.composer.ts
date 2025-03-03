import { Composer, InlineKeyboard } from 'grammy'
import { lang } from '../../../../../localization/base.ts'
import type { TelegramBotCommand } from '../../types.ts'
import { ctxLangCode } from '../../utils/langcode.ts'
import { ErrorsService } from '../../../../errors/errors.service.ts'
import type { UsersService } from '../../../../users/users.service.ts'
import type { CustomContext } from '../../bot.service.ts'

export class ForgetMeComposer {
  private readonly composerName = 'forgetme'
  private readonly composer = new Composer<CustomContext>()

  constructor(
    private readonly usersService: UsersService,
    private readonly errorsService: ErrorsService,
  ) {
    this.composer.command(
      'forgetme',
      (ctx) => this.forgetMe(ctx).catch((error) => this.error(ctx, error)),
    )
    this.composer.callbackQuery(
      'forgetme',
      (ctx) => this.forgetMe(ctx).catch((error) => this.error(ctx, error)),
    )
  }

  get() {
    return this.composer
  }

  async error(ctx: CustomContext, error: Error) {
    console.error(error)
    const dbError = await this.errorsService.create({ composer: this.composerName, ctx: JSON.stringify(ctx, null, 2), error: JSON.stringify(error, null, 2) })
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'error_with_code', value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o suporte clicando em: /support_error_{{error_id}}' }, { error_id: dbError.uuid.split('-')[0] }))
  }

  commands(): TelegramBotCommand[] {
    return [
      { name: 'forgetme', description: (langCode: string | undefined) => lang(langCode, { key: 'forgetme_command_description', value: 'Desvincular conta do Last.fm.' }) },
    ]
  }

  async forgetMe(ctx: CustomContext) {
    if (ctx.callbackQuery !== undefined) {
      void ctx.answerCallbackQuery()
    }
    const author = await ctx.getAuthor()
    const dbUser = await this.usersService.findOneByTelegramId(author.user.id)
    const inlineKeyboard = new InlineKeyboard()
      .text('Vincular conta Last.fm', 'start')
    if (dbUser === null || dbUser.lastfm_username === null) {
      await ctx.reply(lang(ctxLangCode(ctx), { key: 'forgetme_command_no_account_linked', value: 'Não encontrei nenhuma conta Last.fm vinculada ao seu perfil. Parece que você já mandou eu esquecer antes ou nunca vinculou uma. Se quiser vincular uma nova conta, clique no botão abaixo.' }), {
        reply_markup: {
          inline_keyboard: inlineKeyboard.inline_keyboard,
        },
      })
      return
    }
    await this.usersService.update(dbUser.id, {
      lastfm_username: null,
      lastfm_session_key: null,
    })
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'forgetme_command_success', value: 'Sua conta Last.fm foi desvinculada com sucesso. Se quiser vincular outra conta, clique no botão abaixo.' }), {
      reply_markup: {
        inline_keyboard: inlineKeyboard.inline_keyboard,
      },
    })
  }
}
