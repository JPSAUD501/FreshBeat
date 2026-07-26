import type { BaseMessages } from './pt-BR.js'

export const jaJP: BaseMessages = {
  'common.loading': '⏳ 読み込み中…',
  'common.error_with_code':
    '😕 問題が発生しました。チームにはすでに通知済みです！\n\nエラーコード: <code>/support_error_{{errorId}}</code>',
  'common.rate_limited': '🐌 少し落ち着いて！{{seconds}}秒後に再試行してください。',

  'cmd.start.description': 'FreshBeatへようこそ',
  'cmd.help.description': 'できることをすべて見る',
  'cmd.login.description': 'Last.fmアカウントを連携',
  'cmd.forgetme.description': '連携解除とデータ削除',
  'cmd.lyrics.description': '再生中の曲の歌詞',

  'start.welcome':
    '🎧 こんにちは、{{name}}さん！私は<b>FreshBeat</b>、あなたの音楽コンパニオンです。\n\nLast.fmで再生中の曲を表示したり、歌詞を探したり、お気に入りの曲の意味を説明したりします。\n\n/help でできることをすべて確認できます。',
  'start.welcome_back':
    '🎧 また会えてうれしいです、{{name}}さん！/help でコマンドを確認してください。',

  'help.text':
    '📖 <b>できること:</b>\n\n' +
    '/playingnow — 今聴いている曲\n' +
    '/lyrics — 再生中の曲の歌詞\n' +
    '/history — 最近聴いた曲\n' +
    '/brief — 音楽プロフィールのまとめ\n' +
    '/login — Last.fmアカウントを連携\n' +
    '/forgetme — 連携解除とデータ削除\n' +
    '/help — このメッセージ',

  'login.already_linked':
    '✅ Last.fmアカウントはすでに<b>{{lastfmUser}}</b>として連携されています。\n\n別のアカウントに切り替えるには、先に/forgetmeを使ってください。',
  'login.prompt':
    '🔗 Last.fmアカウントを連携しましょう！\n\n下のボタンをタップして認証してください。リンクは{{minutes}}分で期限切れになります。',
  'login.button': 'Last.fmを連携',
  'login.success': '✅ 連携完了！Last.fmの<b>{{lastfmUser}}</b>がFreshBeatにリンクされました。',
  'login.expired': '⏰ この連携リンクは期限切れです。/login で新しいリンクを生成してください。',

  'forgetme.not_linked': '連携されているLast.fmアカウントはありません。',
  'forgetme.done':
    '🧹 完了！Last.fmアカウントの連携を解除し、データを削除しました。\n\n戻りたくなったら /login を使ってください。',

  'lastfm.not_linked':
    '🔒 このコマンドを使うには、先にLast.fmアカウントを連携する必要があります。\n\n/login を使ってください — 1分もかかりません！',

  'playingnow.not_listening': '🔇 現在は何も再生していません（Last.fmによると）。',
  'playingnow.now': '🎧 再生中',
  'playingnow.was': '🕐 再生していました',

  'lyrics.not_found': '😕 <b>{{track}}</b> — {{artist}} の歌詞が見つかりませんでした。',
  'lyrics.source': '出典: {{source}}',
  'lyrics.translate_button': '🌐 翻訳',
  'lyrics.usage':
    '💡 /lyrics で再生中の曲の歌詞を表示。または /lyrics アーティスト - 曲名 と入力してください。',
  'lyrics.instrumental': '🎼 <b>{{track}}</b> — {{artist}} はインストゥルメンタル曲です。',
  'lyrics.translating': '🌐 翻訳中…',
  'lyrics.state_expired': '⏰ この歌詞は期限切れです。/lyrics で再度リクエストしてください。',
  'lyrics.auto_translated': '自動翻訳',
}
