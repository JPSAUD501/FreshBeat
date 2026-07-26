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
  'playingnow.now': '🎧 Listening now',
  'playingnow.was': '🕐 Was listening',

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
