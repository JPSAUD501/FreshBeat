import { Composer, Context, InlineKeyboard, Keyboard } from 'grammy'
import { lang } from '../../../localization/base.ts'
import type { BotCommand, BotConfig } from '../../types.ts'
import { config } from '../../../config.ts'
import { z } from 'zod'
import { decodeBase64Url, encodeBase64Url } from '@std/encoding'
import type { LastFmService } from '../../../services/lastfm/lastfm.service.ts'

export class StartComposer {
  private readonly composer = new Composer()

  constructor(
    private readonly botConfig: BotConfig,
    private readonly lastfmService: LastFmService,
  ) {
    this.composer.command('start', this.start.bind(this))
    this.composer.on(':web_app_data', this.loginWebAppHandler.bind(this))
  }

  get() {
    return this.composer
  }

  commands(): BotCommand[] {
    return [
      { name: 'start', description: (langCode: string | undefined) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }) },
    ]
  }

  getStartProps(ctx: Context): { from_chat_id: number } | null {
    const rawStartProp = ctx.message?.text?.split(' ')[1]
    if (rawStartProp === undefined) return null
    const startPropJson = JSON.parse(new TextDecoder().decode(decodeBase64Url(rawStartProp)))
    const parsedStartProps = z.object({
      from_chat_id: z.number(),
    }).safeParse(startPropJson)
    if (!parsedStartProps.success) return null
    return parsedStartProps.data
  }

  async start(ctx: Context) {
    // const langCode = ctx.message?.from.language_code
    const chatId = ctx.chat?.id
    if (chatId === undefined) {
      ctx.reply('Chat ID is undefined!')
      return
    }
    const startProps = this.getStartProps(ctx)
    const messageAuthor = ctx.message?.from
    await ctx.reply(`Eae <a href="tg://user?id=${messageAuthor?.id}">${messageAuthor?.username}</a>! Tudo bem?!`, {
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true,
      },
    })
    const fromChatData = startProps !== null ? await ctx.api.getChat(startProps.from_chat_id) : undefined
    const fromChatTitle = fromChatData?.title
    const nonPrivateChatResponse = 'Verifiquei aqui que você ainda não vinculou sua conta do Last.fm! Para vincular sua conta, clique no botão abaixo! E não se preocupe, se voce ainda não tem uma eu vou te ajudar a criar!'
    const privateChatResponse = () => {
      switch (true) {
        case (fromChatTitle !== undefined): {
          return `Olá! Você foi redirecionado do chat <b>${fromChatTitle}</b>! Para vincular sua conta do Last.fm, clique no botão que apareceu abaixo!`
        }
        default: {
          return `Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!`
        }
      }
    }
    const webappId = 'Login!'
    const miniAppUrl = `https://${this.botConfig.domain}/api/go?to=${encodeURIComponent(`https://www.last.fm/api/auth/?api_key=${config.LASTFM_API_KEY}`)}`
    const encodedStartProps = encodeBase64Url(JSON.stringify({ from_chat_id: chatId }))
    const goToPrivateUrl = `https://telegram.me/${ctx.me.username}?start=${encodeURIComponent(encodedStartProps)}`
    const nonPrivateInlineKeyboard = new InlineKeyboard()
      .url('Vincular Last.fm!', goToPrivateUrl)
    const privateKeyboard = new Keyboard()
      .placeholder('Cadastre-se com o Last.fm!')
      .webApp(webappId, miniAppUrl)
      .resized().oneTime(true).selected()
    const chatType = ctx.chat?.type
    switch (true) {
      case (chatType !== 'private'): {
        await ctx.reply(nonPrivateChatResponse, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: nonPrivateInlineKeyboard.inline_keyboard,
          },
        })
        return
      }
      default: {
        await ctx.reply(privateChatResponse(), {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: privateKeyboard.keyboard,
          },
        })
        return
      }
    }
  }

  async loginWebAppHandler(ctx: Context) {
    await ctx.reply('Que legal! Acabei de receber algumas informações! Deixa eu dar uma olhada aqui...', {
      reply_markup: {
        remove_keyboard: true,
      },
    })
    const webAppData = ctx.message?.web_app_data
    if (webAppData === undefined) {
      await ctx.reply('Procurei pelas suas informações, mas não encontrei nada! Tente novamente!')
      return
    }
    const { token } = JSON.parse(webAppData.data)
    await ctx.reply(`Pelo menos já identifiquei seu token! Estou coletando o restante das informações...\n\nToken: ${token}`)
    const sessionData = await this.lastfmService.auth.getSession({ token })
    ctx.reply(JSON.stringify(sessionData, null, 2))
  }
}
