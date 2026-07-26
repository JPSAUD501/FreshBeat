import type { BaseMessages } from './pt-BR.js'

export const enUS: BaseMessages = {
  'common.loading': '⏳ Loading…',
  'common.error_with_code':
    '😕 Something went wrong on our side. Our team has been notified!\n\nError code: <code>/support_error_{{errorId}}</code>',
  'common.rate_limited': '🐌 Slow down! Try again in {{seconds}}s.',

  'cmd.start.description': 'Welcome to FreshBeat',
  'cmd.help.description': 'See everything I can do',
  'cmd.login.description': 'Connect your Last.fm account',
  'cmd.forgetme.description': 'Unlink and delete your data',
  'cmd.lyrics.description': 'Lyrics of the current track',
  'cmd.playingnow.description': "What you're listening to now",
  'cmd.pnalbum.description': 'Album of the current track',
  'cmd.pnartist.description': 'Artist of the current track',
  'cmd.history.description': 'Your recent tracks',
  'cmd.brief.description': 'Your music profile summary',

  'start.welcome':
    "🎧 Hi, {{name}}! I'm <b>FreshBeat</b>, your music companion.\n\nI show what you're listening to on Last.fm, find lyrics and explain the meaning of your favorite songs.\n\nUse /help to see everything I can do.",
  'start.welcome_back': '🎧 Great to see you again, {{name}}! Use /help to see the commands.',

  'help.text':
    '📖 <b>What I can do:</b>\n\n' +
    "/playingnow — what you're listening to right now\n" +
    '/lyrics — lyrics of the current track\n' +
    '/history — your recent tracks\n' +
    '/brief — a summary of your music profile\n' +
    '/login — connect your Last.fm account\n' +
    '/forgetme — unlink and delete your data\n' +
    '/help — this message',

  'login.already_linked':
    '✅ Your Last.fm account is already connected as <b>{{lastfmUser}}</b>.\n\nTo switch accounts, use /forgetme first.',
  'login.prompt':
    "🔗 Let's connect your Last.fm account!\n\nTap the button below to authorize. The link expires in {{minutes}} minutes.",
  'login.button': 'Connect Last.fm',
  'login.success': '✅ Connected! Your Last.fm <b>{{lastfmUser}}</b> is now linked to FreshBeat.',
  'login.expired': '⏰ This connection link has expired. Use /login to generate a new one.',

  'forgetme.not_linked': "You don't have a Last.fm account connected.",
  'forgetme.done':
    '🧹 Done! I unlinked your Last.fm account and deleted your data.\n\nIf you want to come back, just use /login.',

  'lastfm.not_linked':
    '🔒 To use this command you need to connect your Last.fm account first.\n\nUse /login — it takes less than a minute!',

  'playingnow.not_listening':
    "🔇 You're not listening to anything right now (according to Last.fm).",
  'playingnow.listening_now': '🎧 <b>{{user}}</b> is listening now:',
  'playingnow.listening_was': '🎧 <b>{{user}}</b> was listening:',
  'playingnow.explicit_badge': '🅴',
  'playingnow.scrobbles_title': '📊 <b>Scrobbles</b>',
  'playingnow.scrobbles_track': '🎵 {{count}}',
  'playingnow.scrobbles_album': '💿 {{count}}',
  'playingnow.scrobbles_artist': '🎤 {{count}}',
  'playingnow.listening_time': "⏱️ You've listened to this track for <b>{{duration}}</b>",
  'playingnow.popularity': '⭐ Popularity: {{stars}}',
  'playingnow.lyrics_button': '🧾 Lyrics',
  'playingnow.artist_connector': 'by',

  'pnalbum.no_album': '😕 The current track has no album identified on Last.fm.',
  'overview.album_now': '🎧 <b>{{user}}</b> is listening to the album:',
  'overview.album_was': '🕐 <b>{{user}}</b> was listening to the album:',
  'overview.artist_now': '🎧 <b>{{user}}</b> is listening to the artist:',
  'overview.artist_was': '🕐 <b>{{user}}</b> was listening to the artist:',
  'overview.artist_line': '🎤 {{artist}}',
  'overview.scrobbles': '📊 <b>{{count}}</b> scrobbles',
  'overview.playtime': '⏱️ Total listening time: <b>{{duration}}</b>',
  'overview.top_tracks': '🎶 <b>Your most played:</b>',

  'history.title': "📒 <b>{{user}}'s history</b>",
  'history.now_playing': '🎧 Listening now: {{track}}',
  'history.empty': '📭 You have no Last.fm history yet.',

  'brief.user_not_found': "😕 Couldn't find user {{user}} on Last.fm.",
  'brief.title': "📊 <b>{{user}}'s music summary</b>",
  'brief.metrics_line1':
    '🎵 {{playcount}} scrobbles · 🎼 {{tracks}} tracks · 🔁 {{repeated}} repeats ({{percent}}%)',
  'brief.metrics_line2': '🎤 {{artists}} artists · 💿 {{albums}} albums',
  'brief.playtime': '⏱️ Total listening time: <b>{{duration}}</b>',
  'brief.avg_duration': '📏 Average track length: {{duration}}',
  'brief.top_tracks': '🎵 <b>Most played tracks</b>',
  'brief.top_albums': '💿 <b>Most played albums</b>',
  'brief.top_artists': '🎤 <b>Most played artists</b>',

  'common.duration.hours_minutes': '{{hours}}h {{minutes}}min',
  'common.duration.minutes': '{{minutes}}min',
  'common.duration.minutes_seconds': '{{minutes}}min {{seconds}}s',

  'lyrics.not_found': "😕 Couldn't find lyrics for <b>{{track}}</b> — {{artist}}.",
  'lyrics.source': 'source: {{source}}',
  'lyrics.translate_button': '🌐 Translate',
  'lyrics.usage': "💡 Use /lyrics for the lyrics of what's playing, or /lyrics artist - track.",
  'lyrics.instrumental': '🎼 <b>{{track}}</b> — {{artist}} is an instrumental track.',
  'lyrics.translating': '🌐 Translating…',
  'lyrics.state_expired': '⏰ These lyrics expired. Ask again with /lyrics.',
  'lyrics.auto_translated': 'automatic translation',

  'lyrics.explain_button': '✨ Explain',
  'lyrics.explaining': '✨ Explaining…',
  'lyrics.ai_explanation': 'AI explanation',
  'image.generating': '🎨 Generating image…',
  'image.caption': '🎨 {{alt}}',
  'image.failed': "😕 I couldn't generate the image this time.",
}
