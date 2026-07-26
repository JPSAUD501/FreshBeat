import type { TempStateStore } from '@freshbeat/cache'
import { msg } from '@freshbeat/i18n'
import { Composer, InlineKeyboard } from 'grammy'
import type { GetLyricsUseCase } from '../../application/use-cases/get-lyrics.js'
import type { GetOrCreateUserUseCase } from '../../application/use-cases/get-or-create-user.js'
import { requireLastfmLinked } from '../../application/use-cases/login.js'
import type { Lyrics } from '../../domain/entities/lyrics.js'
import type { TrackRef } from '../../domain/entities/track.js'
import { NotListeningError } from '../../domain/errors/app-error.js'
import type { RecentTracksProvider } from '../../domain/ports/recent-tracks.js'
import type { FreshBeatContext } from '../context.js'
import type { CommandModule } from './command-module.js'
import { loadingMessage } from '../middlewares/locale.middleware.js'
import { escapeHtml, lyricsFooter, lyricsHeader, paginate } from '../formatters/lyrics.formatter.js'

const usageMessage = msg({
  key: 'lyrics.usage',
  value: '💡 Use /lyrics para a letra do que está tocando, ou /lyrics artista - música.',
})
const instrumentalMessage = msg({
  key: 'lyrics.instrumental',
  value: '🎼 <b>{{track}}</b> — {{artist}} é uma faixa instrumental.',
})
const sourceLabel = msg({ key: 'lyrics.source', value: 'fonte: {{source}}' })
const translateButtonLabel = msg({ key: 'lyrics.translate_button', value: '🌐 Traduzir' })
const explainButtonLabel = msg({ key: 'lyrics.explain_button', value: '✨ Explicar' })

export const LYRICS_STATE_NAMESPACE = 'lyricsctx'
const LYRICS_STATE_TTL_SECONDS = 60 * 60

export interface LyricsCommandDeps {
  getOrCreateUser: GetOrCreateUserUseCase
  recentTracks: RecentTracksProvider
  getLyrics: GetLyricsUseCase
  tempStateStore: TempStateStore
  /** Quando true, oferece os botões de IA — traduzir e explicar. */
  aiEnabled: boolean
}

export function createLyricsCommand(deps: LyricsCommandDeps): CommandModule {
  const composer = new Composer<FreshBeatContext>()

  composer.command('lyrics', async (ctx) => {
    const from = ctx.from
    if (from === undefined) return
    const chatId = ctx.chat.id

    const track = await resolveTrack(ctx, from.id, deps)
    if (track === null) {
      await ctx.reply(ctx.t(usageMessage))
      return
    }

    // UX progressiva: responde rápido e edita com o resultado
    const loading = await ctx.reply(ctx.t(loadingMessage))
    const lyrics = await deps.getLyrics.execute(track)

    if (lyrics.instrumental) {
      await ctx.api.editMessageText(
        chatId,
        loading.message_id,
        ctx.t(instrumentalMessage, { track: lyrics.trackName, artist: lyrics.artistName }),
        { parse_mode: 'HTML' },
      )
      return
    }

    const replyMarkup = deps.aiEnabled
      ? await buildAiKeyboard(ctx, deps.tempStateStore, track)
      : undefined

    const footer = lyricsFooter({
      source: ctx.t(sourceLabel, { source: lyrics.source.name }),
    })
    await sendLyrics(ctx, chatId, loading.message_id, lyrics, footer, replyMarkup)
  })

  return {
    name: 'lyrics',
    description: msg({ key: 'cmd.lyrics.description', value: 'Letra da música que está tocando' }),
    composer,
  }
}

async function resolveTrack(
  ctx: FreshBeatContext,
  telegramUserId: number,
  deps: LyricsCommandDeps,
): Promise<TrackRef | null> {
  // Extrai os argumentos do comando ("/lyrics artista - música")
  const text = ctx.message?.text ?? ''
  const query = text.split(' ').slice(1).join(' ').trim()

  // /lyrics artista - música
  if (query !== '') {
    const separator = query.indexOf(' - ')
    if (separator === -1) return null
    const artist = query.slice(0, separator).trim()
    const name = query.slice(separator + 3).trim()
    if (artist === '' || name === '') return null
    return { name, artist }
  }

  // /lyrics → faixa atual do Last.fm
  const { user } = await deps.getOrCreateUser.execute(telegramUserId)
  requireLastfmLinked(user)
  const recent = await deps.recentTracks.getMostRecentTrack(user.lastfmUsername)
  if (recent === null) throw new NotListeningError()
  return recent
}

/**
 * Botões de IA (traduzir/explicar) compartilham o mesmo token de estado —
 * o contexto (faixa/artista) é o mesmo para os dois fluxos.
 */
async function buildAiKeyboard(
  ctx: FreshBeatContext,
  tempStateStore: TempStateStore,
  track: TrackRef,
): Promise<InlineKeyboard> {
  const token = await tempStateStore.create(LYRICS_STATE_NAMESPACE, track, LYRICS_STATE_TTL_SECONDS)
  return new InlineKeyboard()
    .text(ctx.t(translateButtonLabel), `lyr:tr:${token}`)
    .text(ctx.t(explainButtonLabel), `lyr:ex:${token}`)
}

async function sendLyrics(
  ctx: FreshBeatContext,
  chatId: number,
  loadingMessageId: number,
  lyrics: Lyrics,
  footer: string,
  replyMarkup: InlineKeyboard | undefined,
): Promise<void> {
  const header = lyricsHeader(lyrics)
  const [firstPage, ...rest] = paginate(lyrics.plainLyrics)

  // Primeira página: edita a mensagem de loading (com header, footer e botões)
  await ctx.api.editMessageText(
    chatId,
    loadingMessageId,
    `${header}\n\n${escapeHtml(firstPage ?? '')}\n\n${footer}`,
    { parse_mode: 'HTML', ...(replyMarkup !== undefined ? { reply_markup: replyMarkup } : {}) },
  )

  // Páginas seguintes: mensagens simples
  for (const page of rest) {
    await ctx.reply(escapeHtml(page), { parse_mode: 'HTML' })
  }
}
