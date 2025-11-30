import { lang } from '../../../../../localization/base.ts'
import type { LastFmUserGetInfoResponse } from '../../../../lastfm/user/user.dto.ts'
import type { LastFmTrackInfoResponse } from '../../../../lastfm/track/track.dto.ts'
import type { ArtistInfoResponse } from '../../../../lastfm/artist/artist.dto.ts'
import type { AlbumInfoResponse } from '../../../../lastfm/album/album.dto.ts'
import type * as Soundify from '@soundify/web-api'
import type { DeezerTrack } from '../../../../deezer/track/track.dto.ts'

export type PlayingNowTextParams = {
  langCode: string | undefined
  userInfo: LastFmUserGetInfoResponse
  artistInfo: ArtistInfoResponse
  albumInfo: AlbumInfoResponse
  trackInfo: LastFmTrackInfoResponse
  spotifyTrack: Soundify.Track | undefined
  deezerTrack: DeezerTrack | undefined
  nowPlaying: boolean
}

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function urlLimiter(url: string): string {
  if (url.length > 256) {
    return url.substring(0, 256)
  }
  return url
}

export function getPlayingNowText(params: PlayingNowTextParams): string {
  const { langCode, userInfo, artistInfo, albumInfo, trackInfo, spotifyTrack, deezerTrack, nowPlaying } = params
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo

  let trackDuration = 0
  if (Number(track.duration) > 0) {
    trackDuration = Number(track.duration) / 1000
  } else if (spotifyTrack !== undefined && spotifyTrack.duration_ms > 0) {
    trackDuration = spotifyTrack.duration_ms / 1000
  } else if (deezerTrack !== undefined && deezerTrack.duration > 0) {
    trackDuration = deezerTrack.duration
  }

  const textArray: string[] = []
  const albumImage = album.image[album.image.length - 1]['#text']
  const linksHeader = `<a href="${albumImage}">️️</a>`

  if (nowPlaying) {
    textArray.push(`${linksHeader}${lang(langCode, { key: 'playing_now_header_now_playing', value: '<b><a href="{{userUrl}}">{{username}}</a> está ouvindo</b>' }, {
      userUrl: urlLimiter(user.url),
      username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
    })}`)
    textArray.push('')
  } else {
    textArray.push(`${linksHeader}${lang(langCode, { key: 'playing_now_header_last_track', value: '<b><a href="{{userUrl}}">{{username}}</a> estava ouvindo</b>' }, {
      userUrl: urlLimiter(user.url),
      username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
    })}`)
    textArray.push('')
  }

  const explicitBadge = spotifyTrack?.explicit === true ? '-🅴' : ''
  textArray.push(lang(langCode, { key: 'playing_now_track_with_artist_info', value: '<b>[🎧{{badge}}]</b> <a href="{{trackUrl}}"><b>{{trackName}}</b> por </a><a href="{{artistUrl}}"><b>{{artistName}}</b></a>' }, {
    badge: explicitBadge,
    trackUrl: urlLimiter(track.url),
    trackName: sanitizeText(track.name),
    artistUrl: urlLimiter(artist.url),
    artistName: sanitizeText(artist.name)
  }))

  textArray.push(lang(langCode, { key: 'playing_now_album_name', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }, {
    albumUrl: urlLimiter(album.url),
    albumName: sanitizeText(album.name)
  }))

  textArray.push('')
  textArray.push(lang(langCode, { key: 'playing_now_scrobbles_title', value: '<b>[📊] Scrobbles</b>' }))
  
  const localeCode = lang(langCode, { key: 'locale_lang_code', value: 'pt-BR' })
  textArray.push(lang(langCode, { key: 'playing_now_track_scrobbles', value: '- Música: <b>{{trackPlaycount}}</b>' }, { 
    trackPlaycount: Number(track.userplaycount ?? 0).toLocaleString(localeCode) 
  }))
  
  if (album.userplaycount !== undefined) {
    textArray.push(lang(langCode, { key: 'playing_now_album_scrobbles', value: '- Álbum: <b>{{albumPlaycount}}</b>' }, { 
      albumPlaycount: Number(album.userplaycount).toLocaleString(localeCode) 
    }))
  }
  
  textArray.push(lang(langCode, { key: 'playing_now_artist_scrobbles', value: '- Artista: <b>{{artistPlaycount}}</b>' }, { 
    artistPlaycount: Number(artist.stats.userplaycount ?? 0).toLocaleString(localeCode) 
  }))

  // Info section
  const infoArray: string[] = []
  
  // Track playtime
  if (Number(track.userplaycount ?? 0) > 0 && trackDuration > 0) {
    const totalSeconds = Number(track.userplaycount) * trackDuration
    const playedHours = Math.floor(totalSeconds / 3600)
    const playedMinutes = Math.floor((totalSeconds % 3600) / 60)
    infoArray.push(lang(langCode, { key: 'playing_now_info_track_playtime', value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' }, {
      hours: playedHours.toString(),
      minutes: playedMinutes.toString()
    }))
  }

  // Spotify popularity
  if (spotifyTrack?.popularity !== undefined) {
    const stars = '★'.repeat(Math.floor(spotifyTrack.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyTrack.popularity / 20))
    infoArray.push(lang(langCode, { key: 'playing_now_info_track_popularity', value: '- Popularidade no Spotify: <b>[{{popularity}}][{{stars}}]</b>' }, {
      popularity: spotifyTrack.popularity.toString(),
      stars
    }))
  }

  // Track percentage of album
  const trackPlaycount = Number(track.userplaycount ?? 0)
  const albumPlaycount = Number(album.userplaycount ?? 0)
  const artistPlaycount = Number(artist.stats.userplaycount ?? 0)

  if (
    albumPlaycount >= trackPlaycount &&
    albumPlaycount > 0 &&
    trackPlaycount > 0
  ) {
    const percentage = Number(((trackPlaycount / albumPlaycount) * 100).toFixed(0))
    if (percentage !== 100) {
      infoArray.push(lang(langCode, { key: 'playing_now_info_track_album_percentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse álbum.' }, { 
        percentage: percentage.toLocaleString(localeCode) 
      }))
    }
  }

  // Track percentage of artist
  if (
    artistPlaycount >= trackPlaycount &&
    artistPlaycount > 0 &&
    trackPlaycount > 0
  ) {
    const percentage = Number(((trackPlaycount / artistPlaycount) * 100).toFixed(0))
    if (percentage >= 5) {
      infoArray.push(lang(langCode, { key: 'playing_now_info_track_artist_percentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }, { 
        percentage: percentage.toLocaleString(localeCode) 
      }))
    }
  }

  // Album percentage of artist
  if (
    artistPlaycount >= albumPlaycount &&
    artistPlaycount > 0 &&
    albumPlaycount > 0
  ) {
    const percentage = Number(((albumPlaycount / artistPlaycount) * 100).toFixed(0))
    if (percentage >= 5) {
      infoArray.push(lang(langCode, { key: 'playing_now_info_album_artist_percentage', value: '- Esse álbum representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }, { 
        percentage: percentage.toLocaleString(localeCode) 
      }))
    }
  }

  // Artist percentage of total
  const userPlaycount = Number(user.playcount)
  if (
    userPlaycount >= artistPlaycount &&
    userPlaycount > 0 &&
    artistPlaycount > 0
  ) {
    const percentage = Number(((artistPlaycount / userPlaycount) * 100).toFixed(0))
    if (percentage >= 10) {
      infoArray.push(lang(langCode, { key: 'playing_now_info_artist_user_percentage', value: '- Esse artista representa <b>{{percentage}}%</b> de todas suas reproduções.' }, { 
        percentage: percentage.toLocaleString(localeCode) 
      }))
    }
  }

  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push(lang(langCode, { key: 'playing_now_info_title', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }

  return textArray.join('\n')
}
