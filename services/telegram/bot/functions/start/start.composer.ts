import { Composer, Context, InlineKeyboard, Keyboard } from 'grammy'
import { lang } from '../../../../../localization/base.ts'
import type { TelegramBotCommand } from '../../types.ts'
import { config } from '../../../../../config.ts'
import { decodeBase64Url, encodeBase64Url } from '@std/encoding'
import { LastFmService } from '../../../../lastfm/lastfm.service.ts'
import { ctxLangCode } from '../../utils/langcode.ts'
import { ErrorsService } from '../../../../errors/errors.service.ts'
import type { UsersService } from '../../../../users/users.service.ts'
import { type StartCommandProps, zodStartCommandProps } from './types.ts'
import { crypto } from '@std/crypto'
import type { KeyvalueService } from '../../../../keyvalue/keyvalue.service.ts'

export class StartComposer {
  private readonly composerName = 'start'
  private readonly composer = new Composer()

  constructor(
    private readonly lastfmService: LastFmService,
    private readonly usersService: UsersService,
    private readonly errorsService: ErrorsService,
    private readonly keyvalueService: KeyvalueService,
  ) {
    this.composer.command(
      ['start', 'login'],
      (ctx) => this.start(ctx).catch((error) => this.error(ctx, error)),
    )
    this.composer.callbackQuery(
      ['start'],
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
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_error_with_code', value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte e forneça o código de erro: {{error_id}}' }, { error_id: dbError.id.toString() }))
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
    if (ctx.callbackQuery !== undefined) {
      void ctx.answerCallbackQuery()
    }
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
    if (dbUser.lastfm_username !== null) {
      const inlineKeyboard = new InlineKeyboard()
        .text('Trocar conta do Last.fm', 'forgetme')
      await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_lastfm_account_already_linked', value: 'Oi! Verifiquei aqui e vi que você já vinculou sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm ao FreshBeat! Se quiser vincular outra conta, basta clicar no botão abaixo!' }, { lastfm_username: dbUser.lastfm_username }), {
        parse_mode: 'HTML',
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: inlineKeyboard.inline_keyboard,
        },
      })
    }
    const miniAppUrl = `https://${config.PRODUCTION_DOMAIN}/api/go?to=${encodeURIComponent(`https://www.last.fm/api/auth/?api_key=${config.LASTFM_API_KEY}`)}`
    const miniAppKeyboard = new Keyboard()
      .webApp(lang(ctxLangCode(ctx), { key: 'start_command_link_lastfm_account_keyboard_button', value: 'Vincular Last.fm!' }), miniAppUrl)
      .resized().selected()
    switch (true) {
      case (startProps?.token !== undefined): {
        const { token } = startProps
        const sessionData = await this.lastfmService.auth.createSession({ token })
        await this.usersService.update(dbUser.id, {
          lastfm_session_key: sessionData.session.key,
        })
        const userRecentTracks = await this.lastfmService.user.getRecentTracks({ username: sessionData.session.name, limit: '1', page: '1' })
        if (userRecentTracks.recenttracks.track.length <= 0) {
          const spotifyLinkUrl = `https://${config.PRODUCTION_DOMAIN}/api/go?to=${encodeURIComponent(`https://accounts.spotify.com/authorize?response_type=code&scope=user-read-playback-state+user-read-recently-played&client_id=69d19db6fcb441dd85023c7683c9f771&redirect_uri=https%3A%2F%2Fspotify-webhook.last.fm%2Fspotify-webhook%2Fauth-success&state=baF5hyi8b9RIdGwbx3Nm7shZRBhLaeCniZ1tgUrdZ6d3zcA30NYtLLaYHsIeBlF7D04AlER0YsqzrtqvIWeVcXejvyY%2F8%2BVrVnjNwkrbqGJVrev%2BBklPEU2t0%2Fb4tSvkGWUrejsSX2qp7KQTIP0JvaGxkQIYMBCTGL1a2iEo50D%2BsPVdLDpgdYLgXVSN3YC5lrYmFjFw3mPl3N4A3fvQ9c2swKIdFxLGyITAoxkLp98fZNbxjl4ktWS5lsPUudaOEJphT9fqQxmOk%2FjIybbzqzGil383M7VfSgVKDqSyh0A%3D`)}`
          const inlineKeyboard = new InlineKeyboard()
            .webApp(lang(ctxLangCode(ctx), { key: 'new_lastfm_account_linked_ok', value: 'Vincular Spotify' }), spotifyLinkUrl)
          await ctx.reply(lang(ctxLangCode(ctx), { key: 'lastfm_new_account_inform', value: 'Estou finalizando a vinculação da sua nova conta ao FreshBeat! Não esqueça de clicar no botão abaixo para conectar sua conta do Spotify ao seu perfil do Last.fm enquanto termino de preparar tudo para você!' }), {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: inlineKeyboard.inline_keyboard,
              remove_keyboard: true,
            },
          })
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'lastfm_account_linked_ok', value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm foi vinculada com sucesso! Agora você tem acesso a todas as funcionalidades do FreshBeat! Tente usar o botão abaixo para conferi-las! 🎉' }, { lastfm_username: sessionData.session.name }), {
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
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_from_another_chat_inform', value: 'Te trouxe aqui rapidinho por questões de privacidade! Assim que terminar de vincular sua conta do Last.fm você pode voltar ao chat <b>{{from_chat_tittle}}</b> sem problemas!' }, { from_chat_tittle: fromChatTitle }), {
          parse_mode: 'HTML',
        })
        await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_link_lastfm_account', value: 'Vincule sua conta do telegram <a href="tg://user?id={{user_id}}">{{user_name}}</a> com o Last.fm! Clique no botão abaixo para continuar!' }, { user_id: author.user.id.toString(), user_name: author.user.first_name }), {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: miniAppKeyboard.keyboard,
          },
        })
        break
      }
      case (startProps === null): {
        if (dbUser.lastfm_username === null) {
          await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_no_lastfm_account', value: 'Para ter acesso a todas as funcionalidades do FreshBeat, você precisa vincular sua conta do Last.fm! Se você ainda não tem uma conta, fique tranquilo! Será possível criar ela na pagina de login!' }))
          if (chat.type !== 'private') {
            const props = StartComposer.encodeStartProps({ from_chat_id: chat.id })
            const url = `https://telegram.me/${ctx.me.username}?start=${props}`
            const inlineKeyboard = new InlineKeyboard()
              .url('Continuar!', url)
            return await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_no_lastfm_account_non_private_chat', value: 'Por questões de privacidade, vou te puxar rapidinho para uma conversa privada. Clique no botão abaixo e em seguida em "Iniciar"!' }), {
              reply_markup: {
                inline_keyboard: inlineKeyboard.inline_keyboard,
              },
            })
          }
          await ctx.reply(lang(ctxLangCode(ctx), { key: 'start_command_link_lastfm_account', value: 'Vincule sua conta do telegram <a href="tg://user?id={{user_id}}">{{user_name}}</a> com o Last.fm! Clique no botão abaixo para continuar!' }, { user_id: author.user.id.toString(), user_name: author.user.first_name }), {
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: miniAppKeyboard.keyboard,
            },
          })
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
    const sessionData = await this.lastfmService.auth.createSession({ token })
    const author = await ctx.getAuthor()
    let user = await this.usersService.findOneByTelegramId(author.user.id)
    if (user === null) {
      user = await this.usersService.create({
        telegram_id: author.user.id,
      })
    }
    await this.usersService.update(user.id, {
      lastfm_username: sessionData.session.name,
      lastfm_session_key: sessionData.session.key,
    })
    const inlineKeyboard = new InlineKeyboard()
      .text('Conhecer funcionalidades', 'help')
    const userRecentTracks = await this.lastfmService.user.getRecentTracks({ username: sessionData.session.name, limit: '1', page: '1' })
    if (userRecentTracks.recenttracks.track.length <= 0) {
      const gotoUuid = crypto.randomUUID()
      await this.keyvalueService.create({
        key: gotoUuid,
        value: JSON.stringify({
          used: false,
        }),
      })
      const spotifyLinkUrl = `https://${config.PRODUCTION_DOMAIN}/api/go?to=${encodeURIComponent(`https://accounts.spotify.com/authorize?response_type=code&scope=user-read-playback-state+user-read-recently-played&client_id=69d19db6fcb441dd85023c7683c9f771&redirect_uri=https%3A%2F%2Fspotify-webhook.last.fm%2Fspotify-webhook%2Fauth-success&state=baF5hyi8b9RIdGwbx3Nm7shZRBhLaeCniZ1tgUrdZ6d3zcA30NYtLLaYHsIeBlF7D04AlER0YsqzrtqvIWeVcXejvyY%2F8%2BVrVnjNwkrbqGJVrev%2BBklPEU2t0%2Fb4tSvkGWUrejsSX2qp7KQTIP0JvaGxkQIYMBCTGL1a2iEo50D%2BsPVdLDpgdYLgXVSN3YC5lrYmFjFw3mPl3N4A3fvQ9c2swKIdFxLGyITAoxkLp98fZNbxjl4ktWS5lsPUudaOEJphT9fqQxmOk%2FjIybbzqzGil383M7VfSgVKDqSyh0A%3D`)}&uuid=${encodeURIComponent(gotoUuid)}`
      const inlineKeyboard = new InlineKeyboard()
        .webApp(lang(ctxLangCode(ctx), { key: 'new_lastfm_account_linked_ok', value: 'Vincular Spotify' }), spotifyLinkUrl)
      await ctx.reply(lang(ctxLangCode(ctx), { key: 'lastfm_new_account_inform', value: 'Estou finalizando a vinculação da sua nova conta ao FreshBeat! Não esqueça de clicar no botão abaixo para conectar sua conta do Spotify ao seu perfil do Last.fm enquanto termino de preparar tudo para você!' }), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard.inline_keyboard,
          remove_keyboard: true,
        },
      })
      for (let i = 0; i < 7; i++) {
        const dbKeyvalue = await this.keyvalueService.findOneByKey(gotoUuid)
        if (dbKeyvalue === null) break
        const value = JSON.parse(dbKeyvalue.value)
        if (value.used === true) break
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
    await ctx.reply(lang(ctxLangCode(ctx), { key: 'lastfm_account_linked_ok', value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm foi vinculada com sucesso! Agora você tem acesso a todas as funcionalidades do FreshBeat! Tente usar o botão abaixo para conferi-las! 🎉' }, { lastfm_username: sessionData.session.name }), {
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: inlineKeyboard.inline_keyboard,
      },
    })
  }
}
