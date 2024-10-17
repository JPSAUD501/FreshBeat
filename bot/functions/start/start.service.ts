import { Composer, Context, InlineKeyboard, Keyboard } from 'grammy'
import { lang } from '../../../localization/base.ts'
import type { BotCommand, BotConfig } from '../../types.ts'
import { config } from '../../../config.ts'
import { z } from 'zod'
import { decodeBase64Url, encodeBase64Url } from '@std/encoding'

export class StartComposer {
  private readonly composer = new Composer()
  private readonly config: BotConfig

  constructor(config: BotConfig) {
    this.config = config
    this.composer.command('start', this.start.bind(this))
    this.composer.on(':web_app_data', this.loginWebAppHandler.bind(this))
  }

  get() {
    return this.composer
  }

  commands(): BotCommand[] {
    return [
      { name: 'start', description: (langCode: string | undefined) => lang(langCode, { key: 'start_command_description', value: 'Bem vindo ao FreshBeat!' }) }
    ]
  }

  async start(ctx: Context) {
    const langCode = ctx.message?.from.language_code
    const chatId = ctx.chat?.id
    if (chatId === undefined) {
      ctx.reply('Chat ID is undefined!')
      return
    }
    const rawStartProp = ctx.message?.text?.split(' ')[1]
    let startPropJson: string | undefined = undefined
    if (rawStartProp !== undefined) {
      startPropJson = JSON.parse(new TextDecoder().decode(decodeBase64Url(rawStartProp)))

    }
    console.log('startPropJson', startPropJson)
    const parsedStartProps = z.object({
      fromChatId: z.number()
    }).safeParse(startPropJson)
    const startProps = parsedStartProps.data
    console.log('startProps', startProps)
    const fromChatData = startProps !== undefined ? await ctx.api.getChat(startProps.fromChatId) : undefined
    const fromChatTitle = fromChatData?.title
    const nonPrivateChatResponse = lang(langCode, { key: 'start_non_private_chat_response', value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' })
    const privateChatResponse = fromChatTitle !== undefined ? lang(langCode, { key: 'start_private_chat_from_another_chat_response', value: 'Olá! Você foi redirecionado do chat {{from_chat_tittle}}! Para vincular sua conta do Last.fm, clique no botão  que apareceu abaixo!' }, { from_chat_tittle: fromChatTitle }) : lang(langCode, { key: 'start_private_chat_response', value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' })
    const webappId = 'Login!'
    const miniAppUrl = `https://www.last.fm/api/auth/?api_key=${config.LASTFM_API_KEY}`
    const encodedStartProps = encodeBase64Url(JSON.stringify({ fromChatId: chatId }))
    const goToPrivateUrl = `https://telegram.me/${ctx.me.username}?start=${encodeURIComponent(encodedStartProps)}`
    console.log('goToPrivateUrl', goToPrivateUrl)
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
          reply_markup: {
            inline_keyboard: nonPrivateInlineKeyboard.inline_keyboard
          },	
        })
        return
      }
      default: {
        await ctx.reply(privateChatResponse, {
          reply_markup: {
            keyboard: privateKeyboard.keyboard
          },
        })
        return
      }
    }
  }

  async loginWebAppHandler(ctx: Context) {
    await ctx.reply('Web app data received!')
    await ctx.reply(JSON.stringify(ctx, null, 2))
  }
}