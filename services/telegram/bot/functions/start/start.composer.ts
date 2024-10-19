import { Composer, Context, InlineKeyboard, Keyboard } from 'grammy'
import { lang } from '../../../../../localization/base.ts'
import type { TelegramBotCommand } from '../../types.ts'
import { config } from '../../../../../config.ts'
import { decodeBase64Url, encodeBase64Url } from '@std/encoding'
import type { LastFmService } from '../../../../lastfm/lastfm.service.ts'
import { ctxLangCode } from '../../utils/langcode.ts'
import { ErrorsService } from '../../../../errors/errors.service.ts'
import type { UsersService } from '../../../../users/users.service.ts'
import { type StartCommandProps, zodStartCommandProps } from './types.ts'

export class StartComposer {
  private readonly composerName = 'start'
  private readonly composer = new Composer()

  constructor(
    private readonly lastfmService: LastFmService,
    private readonly usersService: UsersService,
    private readonly errorsService: ErrorsService,
  ) {
    this.composer.command(
      ['start', 'login'],
      (ctx) => this.start(ctx).catch((error) => this.error(ctx, error)),
    )
    this.composer.on(
      [':web_app_data'],
      (ctx) => this.loginWebAppDataHandler(ctx).catch((error) => this.error(ctx, error)),
    )
  }

  get() {
    return this.composer
  }

  async error(ctx: Context, error: Error) {
    console.error(error)
    const dbError = await this.errorsService.create({ composer: this.composerName, ctx: JSON.stringify(ctx, null, 2), error: error.message })
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_error', value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte forneça o código de erro: {{error_id}}' }, { error_id: dbError.id.toString() }))
  }

  commands(): TelegramBotCommand[] {
    return [
      { name: 'start', description: (langCode: string | undefined) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }) },
    ]
  }

  static encodeStartProps(props: StartCommandProps): string {
    return encodeBase64Url(JSON.stringify(props))
  }

  getStartProps(ctx: Context): StartCommandProps | null {
    const rawStartProp = ctx.message?.text?.split(' ')[1]
    if (rawStartProp === undefined) return null
    const startPropJson = JSON.parse(new TextDecoder().decode(decodeBase64Url(rawStartProp)))
    const parsedStartProps = zodStartCommandProps.safeParse(startPropJson)
    if (!parsedStartProps.success) return null
    return parsedStartProps.data
  }

  async start(ctx: Context) {
    const chat = await ctx.getChat()
    const author = await ctx.getAuthor()
    const startProps = this.getStartProps(ctx)
    let dbUser = await this.usersService.findOneByTelegramId(author.user.id)
    if (dbUser === null) {
      dbUser = await this.usersService.create({
        telegram_id: author.user.id,
      })
      await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_first_time', value: 'Olá! Que prazer em te conhecer <a href="tg://user?id={{user_id}}">{{user_name}}</a>! Tudo bem?!' }, { user_id: author.user.id.toString(), user_name: author.user.first_name }), {
        parse_mode: 'HTML',
        reply_markup: {
          remove_keyboard: true,
        },
      })
      await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_what_i_do', value: 'Eu sou o FreshBeat! Te ajudo a acompanhar sua vida musical junto com o Last.fm e utilizo inteligência artificial para criar novas experiências musicais para você!' }))
    }
    switch (true) {
      case (startProps?.token !== undefined): {
        const { token } = startProps
        const sessionData = await this.lastfmService.auth.getSession({ token })
        await this.usersService.update(dbUser.id, {
          lastfm_session_key: sessionData.session.key,
        })
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'webapp_lastfm_account_linked', value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> foi vinculada com sucesso!' }, { lastfm_username: sessionData.session.name }), {
          parse_mode: 'HTML',
          reply_markup: {
            remove_keyboard: true,
          },
        })
        break
      }
      case (startProps?.from_chat_id !== undefined): {
        const fromChatData = await ctx.api.getChat(startProps.from_chat_id)
        const fromChatTitle = fromChatData.title ?? fromChatData.username ?? fromChatData.first_name
        const inlineKeyboard = new InlineKeyboard()
          .url('Voltar ao chat!', `https://t.me/c/${startProps.from_chat_id.toString()}`)
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_from_another_chat', value: 'Te trouxe aqui rapidinho por questões de privacidade! Assim que terminar de vincular sua conta do Last.fm, utilize o botão abaixo para voltar ao chat <b>{{from_chat_tittle}}</b>!' }, { from_chat_tittle: fromChatTitle }), {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inlineKeyboard.inline_keyboard,
          },
        })
        const miniAppUrl = `https://${config.PRODUCTION_DOMAIN}/api/go?to=${encodeURIComponent(`https://www.last.fm/api/auth/?api_key=${config.LASTFM_API_KEY}`)}`
        const keyboard = new Keyboard()
          .webApp(lang(ctxLangCode(ctx), { key: 'start_command_link_lastfm_account_keyboard_button', value: 'Vincular Last.fm!' }), miniAppUrl)
          .resized().oneTime(true).selected()
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_link_lastfm_account', value: 'Vincule sua conta do telegram <a href="tg://user?id={{user_id}}">{{user_name}}</a> com o Last.fm! Clique no botão abaixo para continuar!' }, { user_id: author.user.id.toString(), user_name: author.user.first_name }), {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: keyboard.keyboard,
          },
        })
        break
      }
      case (startProps === null): {
        if (dbUser.lastfm_session_key === null) {
          await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_no_lastfm_account', value: 'Para ter acesso a todas as funcionalidades do FreshBeat, você precisa vincular sua conta do Last.fm! Se você ainda não tem uma conta, fique tranquilo! Será possível criar ela na pagina de login!' }))
          if (chat.type !== 'private') {
            const props = StartComposer.encodeStartProps({ from_chat_id: chat.id })
            const url = `https://telegram.me/${ctx.me.username}?start=${props}`
            const inlineKeyboard = new InlineKeyboard()
              .url('Continuar!', url)
            await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_no_lastfm_account_non_private_chat', value: 'Por questões de privacidade, vou te puxar rapidinho para uma conversa privada. Clique no botão abaixo e em seguida em "Iniciar"!' }), {
              reply_markup: {
                inline_keyboard: inlineKeyboard.inline_keyboard,
              },
            })
          }
        }
        break
      }
      default: {
        throw new Error('Invalid start command mode!')
      }
    }
  }

  async loginWebAppDataHandler(ctx: Context) {
    const webAppData = ctx.message?.web_app_data
    if (webAppData === undefined) {
      throw new Error('WebApp data received is undefined!')
    }
    const { token } = JSON.parse(webAppData.data)
    const sessionData = await this.lastfmService.auth.getSession({ token })
    const author = await ctx.getAuthor()
    let user = await this.usersService.findOneByTelegramId(author.user.id)
    if (user === null) {
      user = await this.usersService.create({
        telegram_id: author.user.id,
      })
    }
    await this.usersService.update(user.id, {
      lastfm_session_key: sessionData.session.key,
    })
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'webapp_lastfm_account_linked', value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> foi vinculada com sucesso!' }, { lastfm_username: sessionData.session.name }), {
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true,
      },
    })
  }
}
