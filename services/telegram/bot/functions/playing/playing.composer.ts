import { Composer, InlineKeyboard } from 'grammy'
import { lang } from '../../../../../localization/base.ts'
import type { TelegramBotCommand } from '../../types.ts'
import { ctxLangCode } from '../../utils/langcode.ts'
import { ErrorsService } from '../../../../errors/errors.service.ts'
import type { UsersService } from '../../../../users/users.service.ts'
import type { CustomContext } from '../../bot.service.ts'
import { LastFmService } from '../../../../lastfm/lastfm.service.ts'
import { SpotifyService } from '../../../../spotify/spotify.service.ts'
import { DeezerService } from '../../../../deezer/deezer.service.ts'
import { getPlayingNowText } from './playing.text.ts'

export class PlayingComposer {
  private readonly composerName = 'playing'
  private readonly composer = new Composer<CustomContext>()
  private readonly spotifyService = new SpotifyService()
  private readonly deezerService = new DeezerService()

  constructor(
    private readonly lastfmService: LastFmService,
    private readonly usersService: UsersService,
    private readonly errorsService: ErrorsService,
  ) {
    this.composer.command(
      ['pn', 'np', 'playingnow', 'nowplaying'],
      (ctx) => this.playingNow(ctx).catch((error) => this.error(ctx, error)),
    )
    this.composer.callbackQuery(
      'playing',
      (ctx) => this.playingNow(ctx).catch((error) => this.error(ctx, error)),
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
      { name: 'pn', description: (langCode: string | undefined) => lang(langCode, { key: 'playing_now_command_description', value: 'Mostrar o que você está ouvindo agora.' }) },
    ]
  }

  async playingNow(ctx: CustomContext) {
    if (ctx.callbackQuery !== undefined) {
      void ctx.answerCallbackQuery()
    }

    const langCode = ctxLangCode(ctx)
    const author = await ctx.getAuthor()
    const dbUser = await this.usersService.findOneByTelegramId(author.user.id)

    // Check if user exists and has Last.fm linked
    if (dbUser === null || dbUser.lastfm_username === null) {
      const inlineKeyboard = new InlineKeyboard()
        .text(lang(langCode, { key: 'playing_now_link_lastfm_button', value: 'Vincular Last.fm' }), 'start')
      await ctx.reply(lang(langCode, { key: 'playing_now_no_lastfm_account', value: 'Você precisa vincular sua conta do Last.fm primeiro! Clique no botão abaixo para começar.' }), {
        reply_markup: inlineKeyboard,
      })
      return
    }

    const lastfmUsername = dbUser.lastfm_username

    // Get user info and recent tracks in parallel
    const [userInfo, userRecentTracks] = await Promise.all([
      this.lastfmService.user.getInfo({ username: lastfmUsername }),
      this.lastfmService.user.getRecentTracks({ username: lastfmUsername, limit: '1', page: '1' }),
    ])

    // Check if user has any tracks
    if (userRecentTracks.recenttracks.track.length === 0) {
      await ctx.reply(lang(langCode, { key: 'playing_now_no_recent_tracks', value: 'Parece que você ainda não ouviu nenhuma música no Last.fm! Que tal começar a ouvir algo agora?' }))
      return
    }

    const recentTrack = userRecentTracks.recenttracks.track[0]
    const nowPlaying = recentTrack['@attr']?.nowplaying === 'true'
    const trackName = recentTrack.name
    const artistName = recentTrack.artist.name
    const albumName = recentTrack.album['#text']

    // Get detailed info in parallel
    const [artistInfo, albumInfo, trackInfo, spotifyTracks, deezerTracks] = await Promise.all([
      this.lastfmService.artist.getInfo({ artist: artistName, username: lastfmUsername }),
      this.lastfmService.album.getInfo({ artist: artistName, album: albumName, username: lastfmUsername }),
      this.lastfmService.track.getInfo({ artist: artistName, track: trackName, username: lastfmUsername }),
      this.spotifyService.track.getTrackInfo({ track: trackName, artist: artistName, limit: 1 }).catch(() => []),
      this.deezerService.track.search({ track: trackName, artist: artistName, limit: 1 }).catch(() => ({ data: [] })),
    ])

    const spotifyTrack = spotifyTracks.length > 0 ? spotifyTracks[0] : undefined
    const deezerTrack = deezerTracks.data.length > 0 ? deezerTracks.data[0] : undefined

    // Generate message text
    const text = getPlayingNowText({
      langCode,
      userInfo,
      artistInfo,
      albumInfo,
      trackInfo,
      spotifyTrack,
      deezerTrack,
      nowPlaying,
    })

    // Build inline keyboard with links
    const inlineKeyboard = new InlineKeyboard()

    // Spotify and Deezer buttons (same row)
    if (spotifyTrack !== undefined) {
      inlineKeyboard.url(lang(langCode, { key: 'playing_now_spotify_button', value: '[🎧] Spotify' }), spotifyTrack.external_urls.spotify)
    }
    if (deezerTrack !== undefined) {
      inlineKeyboard.url(lang(langCode, { key: 'playing_now_deezer_button', value: '[🎧] Deezer' }), deezerTrack.link)
    }
    if (spotifyTrack !== undefined || deezerTrack !== undefined) {
      inlineKeyboard.row()
    }

    // Last.fm track link
    inlineKeyboard.url(lang(langCode, { key: 'playing_now_lastfm_button', value: '[📊] Last.fm' }), trackInfo.track.url)

    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard,
      link_preview_options: {
        show_above_text: true,
        prefer_large_media: true,
      },
    })
  }
}
