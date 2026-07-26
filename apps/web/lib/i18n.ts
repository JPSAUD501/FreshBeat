import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@freshbeat/i18n'

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale }

/**
 * Catálogos do SITE (o bot tem os seus em packages/i18n).
 * pt-BR é a base tipada — os demais idiomas são checados em
 * compile-time contra ela, igual ao bot.
 */
const ptBR = {
  'nav.home': 'Início',
  'nav.dashboard': 'Painel',
  'nav.privacy': 'Privacidade',
  'nav.terms': 'Termos',

  'landing.hero_title': 'Seu companheiro de música no Telegram',
  'landing.hero_subtitle':
    'O FreshBeat mostra o que você está ouvindo no Last.fm, busca letras, traduz e explica o significado das suas músicas favoritas — e ainda cria arte por IA inspirada nelas.',
  'landing.cta': 'Abrir no Telegram',
  'landing.features_title': 'O que ele faz',
  'landing.feature_stats_title': '📊 Stats do Last.fm',
  'landing.feature_stats_text':
    'Tocando agora com scrobbles, tempo de audição e popularidade, além de histórico e um resumo completo do seu perfil musical.',
  'landing.feature_lyrics_title': '🧾 Letras',
  'landing.feature_lyrics_text':
    'Letra da música que está tocando em segundos, com tradução automática para o seu idioma.',
  'landing.feature_ai_title': '✨ IA criativa',
  'landing.feature_ai_text':
    'Explicação do significado da letra no seu idioma e uma imagem única gerada por IA para cada música.',
  'landing.commands_title': 'Comandos',
  'landing.open_source': 'Código aberto',
  'landing.opensource_text':
    'O FreshBeat é open source — veja o código, sugira features e contribua no GitHub.',

  'footer.made_with': 'Feito com 💚 para quem ama música.',

  'privacy.title': 'Política de Privacidade',
  'privacy.updated': 'Última atualização: {{date}}',
  'privacy.collect_title': 'O que coletamos',
  'privacy.collect_text':
    'Guardamos apenas o seu ID do Telegram, o nome de usuário do Last.fm que você vincula e o idioma preferido. Erros inesperados são registrados com um código de suporte para investigação.',
  'privacy.use_title': 'Como usamos',
  'privacy.use_text':
    'Os dados servem exclusivamente para responder aos seus comandos no bot e exibir o seu painel neste site. Não vendemos nem compartilhamos dados com terceiros para marketing.',
  'privacy.third_title': 'Serviços de terceiros',
  'privacy.third_text':
    'Para funcionar, o FreshBeat consulta Last.fm, Spotify, Deezer, provedores de letras e APIs de IA (OpenRouter, Replicate). Essas chamadas carregam apenas o necessário (ex.: nome da faixa e do artista).',
  'privacy.delete_title': 'Exclusão dos seus dados',
  'privacy.delete_text':
    'Use /forgetme no bot a qualquer momento para desvincular o Last.fm e apagar os seus dados da nossa base.',

  'terms.title': 'Termos de Uso',
  'terms.service_title': 'O serviço',
  'terms.service_text':
    'O FreshBeat é um bot gratuito e de código aberto para Telegram que exibe estatísticas do Last.fm, letras e conteúdo gerado por IA.',
  'terms.fair_title': 'Uso justo',
  'terms.fair_text':
    'Não abuse do serviço: spam, automação maliciosa ou tentativas de sobrecarga podem levar ao bloqueio do seu usuário.',
  'terms.content_title': 'Conteúdo',
  'terms.content_text':
    'Letras e metadados pertencem aos seus detentores de direitos. O conteúdo gerado por IA (explicações, traduções e imagens) é fornecido como está, sem garantia de precisão.',
  'terms.liability_title': 'Responsabilidade',
  'terms.liability_text':
    'O serviço é oferecido "como está", sem garantias. Podemos alterar ou encerrar funcionalidades a qualquer momento, sem aviso prévio.',

  'dashboard.title': 'Seu painel',
  'dashboard.hello': 'Olá, {{name}}!',
  'dashboard.login_error': 'Não conseguimos validar seu login com o Telegram. Tente de novo.',
  'dashboard.login_prompt': 'Entre com o Telegram para ver sua conta vinculada.',
  'dashboard.linked_as': 'Last.fm vinculado',
  'dashboard.not_linked': 'Você ainda não vinculou o Last.fm. Use /login no bot.',
  'dashboard.unlink': 'Desvincular Last.fm',
  'dashboard.unlink_confirm': 'Tem certeza? Você pode vincular de novo quando quiser.',
  'dashboard.logout': 'Sair',
  'dashboard.stats_title': 'Seus números no Last.fm',
  'dashboard.stats_scrobbles': 'scrobbles',
  'dashboard.stats_artists': 'artistas',
  'dashboard.stats_albums': 'álbuns',
  'dashboard.stats_tracks': 'faixas',

  'login.lastfm_start': 'Conectando ao Last.fm…',
  'login.lastfm_error': 'Não conseguimos conectar ao Last.fm. Tente de novo pelo /login no bot.',
  'login.success_title': 'Conta conectada! 🎉',
  'login.success_text':
    'Seu Last.fm foi vinculado ao FreshBeat. Volte para o Telegram e use /playingnow.',
  'login.expired': 'Esse link de conexão expirou ou já foi usado. Gere um novo com /login no bot.',
} as const

export type WebMessageKey = keyof typeof ptBR

const enUS: Record<WebMessageKey, string> = {
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.privacy': 'Privacy',
  'nav.terms': 'Terms',

  'landing.hero_title': 'Your music companion on Telegram',
  'landing.hero_subtitle':
    "FreshBeat shows what you're listening to on Last.fm, finds lyrics, translates and explains the meaning of your favorite songs — and even creates AI art inspired by them.",
  'landing.cta': 'Open in Telegram',
  'landing.features_title': 'What it does',
  'landing.feature_stats_title': '📊 Last.fm stats',
  'landing.feature_stats_text':
    'Now playing with scrobbles, listening time and popularity, plus history and a full summary of your music profile.',
  'landing.feature_lyrics_title': '🧾 Lyrics',
  'landing.feature_lyrics_text':
    'Lyrics of the current track in seconds, with automatic translation into your language.',
  'landing.feature_ai_title': '✨ Creative AI',
  'landing.feature_ai_text':
    'An explanation of the lyrics meaning in your language and a unique AI-generated image for every song.',
  'landing.commands_title': 'Commands',
  'landing.open_source': 'Open source',
  'landing.opensource_text':
    'FreshBeat is open source — read the code, suggest features and contribute on GitHub.',

  'footer.made_with': 'Made with 💚 for music lovers.',

  'privacy.title': 'Privacy Policy',
  'privacy.updated': 'Last updated: {{date}}',
  'privacy.collect_title': 'What we collect',
  'privacy.collect_text':
    'We only store your Telegram ID, the Last.fm username you link and your preferred language. Unexpected errors are logged with a support code for investigation.',
  'privacy.use_title': 'How we use it',
  'privacy.use_text':
    'Your data is used exclusively to answer your bot commands and show your dashboard on this site. We do not sell or share data with third parties for marketing.',
  'privacy.third_title': 'Third-party services',
  'privacy.third_text':
    'To work, FreshBeat queries Last.fm, Spotify, Deezer, lyrics providers and AI APIs (OpenRouter, Replicate). These calls carry only what is needed (e.g. track and artist names).',
  'privacy.delete_title': 'Deleting your data',
  'privacy.delete_text':
    'Use /forgetme in the bot at any time to unlink Last.fm and delete your data from our database.',

  'terms.title': 'Terms of Use',
  'terms.service_title': 'The service',
  'terms.service_text':
    'FreshBeat is a free, open-source Telegram bot that shows Last.fm stats, lyrics and AI-generated content.',
  'terms.fair_title': 'Fair use',
  'terms.fair_text':
    'Do not abuse the service: spam, malicious automation or overload attempts may get your user blocked.',
  'terms.content_title': 'Content',
  'terms.content_text':
    'Lyrics and metadata belong to their rights holders. AI-generated content (explanations, translations and images) is provided as is, with no accuracy guarantee.',
  'terms.liability_title': 'Liability',
  'terms.liability_text':
    'The service is provided "as is", without warranties. We may change or discontinue features at any time, without notice.',

  'dashboard.title': 'Your dashboard',
  'dashboard.hello': 'Hello, {{name}}!',
  'dashboard.login_error': "We couldn't validate your Telegram login. Please try again.",
  'dashboard.login_prompt': 'Sign in with Telegram to see your linked account.',
  'dashboard.linked_as': 'Linked Last.fm',
  'dashboard.not_linked': "You haven't linked Last.fm yet. Use /login in the bot.",
  'dashboard.unlink': 'Unlink Last.fm',
  'dashboard.unlink_confirm': 'Are you sure? You can link again whenever you want.',
  'dashboard.logout': 'Sign out',
  'dashboard.stats_title': 'Your Last.fm numbers',
  'dashboard.stats_scrobbles': 'scrobbles',
  'dashboard.stats_artists': 'artists',
  'dashboard.stats_albums': 'albums',
  'dashboard.stats_tracks': 'tracks',

  'login.lastfm_start': 'Connecting to Last.fm…',
  'login.lastfm_error': "We couldn't connect to Last.fm. Try again via /login in the bot.",
  'login.success_title': 'Account connected! 🎉',
  'login.success_text':
    'Your Last.fm is now linked to FreshBeat. Go back to Telegram and use /playingnow.',
  'login.expired':
    'This connection link expired or was already used. Generate a new one with /login in the bot.',
}

const jaJP: Record<WebMessageKey, string> = {
  'nav.home': 'ホーム',
  'nav.dashboard': 'ダッシュボード',
  'nav.privacy': 'プライバシー',
  'nav.terms': '利用規約',

  'landing.hero_title': 'Telegramの音楽コンパニオン',
  'landing.hero_subtitle':
    'FreshBeatはLast.fmで再生中の曲を表示し、歌詞を見つけ、翻訳し、お気に入りの曲の意味を説明します。さらに曲にインスパイアされたAIアートも生成します。',
  'landing.cta': 'Telegramで開く',
  'landing.features_title': 'できること',
  'landing.feature_stats_title': '📊 Last.fm統計',
  'landing.feature_stats_text':
    'スクリッブル、再生時間、人気度付きの再生中表示に加え、履歴や音楽プロフィールのまとめも。',
  'landing.feature_lyrics_title': '🧾 歌詞',
  'landing.feature_lyrics_text': '再生中の曲の歌詞を数秒で表示。あなたの言語への自動翻訳付き。',
  'landing.feature_ai_title': '✨ クリエイティブAI',
  'landing.feature_ai_text':
    '歌詞の意味をあなたの言語で説明し、曲ごとにユニークなAI画像を生成します。',
  'landing.commands_title': 'コマンド',
  'landing.open_source': 'オープンソース',
  'landing.opensource_text':
    'FreshBeatはオープンソースです。GitHubでコードを読み、機能を提案し、貢献できます。',

  'footer.made_with': '音楽を愛する人へ 💚 を込めて。',

  'privacy.title': 'プライバシーポリシー',
  'privacy.updated': '最終更新: {{date}}',
  'privacy.collect_title': '収集するもの',
  'privacy.collect_text':
    'Telegram ID、連携したLast.fmユーザー名、希望言語のみを保存します。予期しないエラーは調査用のサポートコード付きで記録されます。',
  'privacy.use_title': '利用方法',
  'privacy.use_text':
    'データはボットのコマンドへの応答とこのサイトのダッシュボード表示のためだけに使われます。マーケティング目的で第三者に販売・共有することはありません。',
  'privacy.third_title': '第三者サービス',
  'privacy.third_text':
    'FreshBeatはLast.fm、Spotify、Deezer、歌詞プロバイダー、AI API（OpenRouter、Replicate）に問い合わせます。これらの呼び出しには必要最小限（曲名やアーティスト名など）のみが含まれます。',
  'privacy.delete_title': 'データの削除',
  'privacy.delete_text':
    'ボットで /forgetme を使えば、いつでもLast.fmの連携を解除し、データを削除できます。',

  'terms.title': '利用規約',
  'terms.service_title': 'サービスについて',
  'terms.service_text':
    'FreshBeatは、Last.fmの統計、歌詞、AI生成コンテンツを表示する無料のオープンソースTelegramボットです。',
  'terms.fair_title': '適正利用',
  'terms.fair_text':
    'スパム、悪意ある自動化、過負荷を意図した行為など、サービスの悪用はおやめください。ユーザーをブロックする場合があります。',
  'terms.content_title': 'コンテンツ',
  'terms.content_text':
    '歌詞やメタデータは権利者に帰属します。AI生成コンテンツ（説明、翻訳、画像）は現状のまま提供され、正確性の保証はありません。',
  'terms.liability_title': '免責',
  'terms.liability_text':
    '本サービスは「現状のまま」提供され、保証はありません。機能は予告なく変更・終了する場合があります。',

  'dashboard.title': 'ダッシュボード',
  'dashboard.hello': 'こんにちは、{{name}}！',
  'dashboard.login_error': 'Telegramログインを検証できませんでした。もう一度お試しください。',
  'dashboard.login_prompt': 'Telegramでログインして、連携アカウントを確認しましょう。',
  'dashboard.linked_as': '連携中のLast.fm',
  'dashboard.not_linked': 'まだLast.fmが連携されていません。ボットで /login を使ってください。',
  'dashboard.unlink': 'Last.fmの連携を解除',
  'dashboard.unlink_confirm': '本当によろしいですか？いつでも再連携できます。',
  'dashboard.logout': 'ログアウト',
  'dashboard.stats_title': 'Last.fmの記録',
  'dashboard.stats_scrobbles': 'スクリッブル',
  'dashboard.stats_artists': 'アーティスト',
  'dashboard.stats_albums': 'アルバム',
  'dashboard.stats_tracks': '曲',

  'login.lastfm_start': 'Last.fmに接続中…',
  'login.lastfm_error':
    'Last.fmに接続できませんでした。ボットの /login からもう一度お試しください。',
  'login.success_title': 'アカウント連携完了！ 🎉',
  'login.success_text':
    'Last.fmがFreshBeatにリンクされました。Telegramに戻って /playingnow を使ってください。',
  'login.expired':
    'この連携リンクは期限切れか使用済みです。ボットで /login を使って新しく発行してください。',
}

const esES: Record<WebMessageKey, string> = {
  'nav.home': 'Inicio',
  'nav.dashboard': 'Panel',
  'nav.privacy': 'Privacidad',
  'nav.terms': 'Términos',

  'landing.hero_title': 'Tu compañero de música en Telegram',
  'landing.hero_subtitle':
    'FreshBeat muestra lo que estás escuchando en Last.fm, busca letras, traduce y explica el significado de tus canciones favoritas — y hasta crea arte con IA inspirado en ellas.',
  'landing.cta': 'Abrir en Telegram',
  'landing.features_title': 'Qué hace',
  'landing.feature_stats_title': '📊 Stats de Last.fm',
  'landing.feature_stats_text':
    'Lo que suena ahora con scrobbles, tiempo de escucha y popularidad, además de historial y un resumen completo de tu perfil musical.',
  'landing.feature_lyrics_title': '🧾 Letras',
  'landing.feature_lyrics_text':
    'La letra de la canción que suena en segundos, con traducción automática a tu idioma.',
  'landing.feature_ai_title': '✨ IA creativa',
  'landing.feature_ai_text':
    'Explicación del significado de la letra en tu idioma y una imagen única generada por IA para cada canción.',
  'landing.commands_title': 'Comandos',
  'landing.open_source': 'Código abierto',
  'landing.opensource_text':
    'FreshBeat es open source — mira el código, sugiere funciones y contribuye en GitHub.',

  'footer.made_with': 'Hecho con 💚 para quienes aman la música.',

  'privacy.title': 'Política de Privacidad',
  'privacy.updated': 'Última actualización: {{date}}',
  'privacy.collect_title': 'Qué recopilamos',
  'privacy.collect_text':
    'Solo guardamos tu ID de Telegram, el usuario de Last.fm que vinculas y tu idioma preferido. Los errores inesperados se registran con un código de soporte para investigación.',
  'privacy.use_title': 'Cómo lo usamos',
  'privacy.use_text':
    'Los datos se usan exclusivamente para responder a tus comandos en el bot y mostrar tu panel en este sitio. No vendemos ni compartimos datos con terceros para marketing.',
  'privacy.third_title': 'Servicios de terceros',
  'privacy.third_text':
    'Para funcionar, FreshBeat consulta Last.fm, Spotify, Deezer, proveedores de letras y APIs de IA (OpenRouter, Replicate). Estas llamadas llevan solo lo necesario (p. ej. nombre de la pista y del artista).',
  'privacy.delete_title': 'Eliminación de tus datos',
  'privacy.delete_text':
    'Usa /forgetme en el bot en cualquier momento para desvincular Last.fm y borrar tus datos de nuestra base.',

  'terms.title': 'Términos de Uso',
  'terms.service_title': 'El servicio',
  'terms.service_text':
    'FreshBeat es un bot de Telegram gratuito y de código abierto que muestra estadísticas de Last.fm, letras y contenido generado por IA.',
  'terms.fair_title': 'Uso justo',
  'terms.fair_text':
    'No abuses del servicio: spam, automatización maliciosa o intentos de sobrecarga pueden llevar al bloqueo de tu usuario.',
  'terms.content_title': 'Contenido',
  'terms.content_text':
    'Las letras y los metadatos pertenecen a sus titulares de derechos. El contenido generado por IA (explicaciones, traducciones e imágenes) se ofrece tal cual, sin garantía de precisión.',
  'terms.liability_title': 'Responsabilidad',
  'terms.liability_text':
    'El servicio se ofrece "tal cual", sin garantías. Podemos cambiar o descontinuar funciones en cualquier momento, sin previo aviso.',

  'dashboard.title': 'Tu panel',
  'dashboard.hello': '¡Hola, {{name}}!',
  'dashboard.login_error':
    'No pudimos validar tu inicio de sesión con Telegram. Inténtalo de nuevo.',
  'dashboard.login_prompt': 'Inicia sesión con Telegram para ver tu cuenta vinculada.',
  'dashboard.linked_as': 'Last.fm vinculado',
  'dashboard.not_linked': 'Aún no vinculaste Last.fm. Usa /login en el bot.',
  'dashboard.unlink': 'Desvincular Last.fm',
  'dashboard.unlink_confirm': '¿Seguro? Puedes vincular de nuevo cuando quieras.',
  'dashboard.logout': 'Cerrar sesión',
  'dashboard.stats_title': 'Tus números en Last.fm',
  'dashboard.stats_scrobbles': 'scrobbles',
  'dashboard.stats_artists': 'artistas',
  'dashboard.stats_albums': 'álbumes',
  'dashboard.stats_tracks': 'canciones',

  'login.lastfm_start': 'Conectando con Last.fm…',
  'login.lastfm_error': 'No pudimos conectar con Last.fm. Inténtalo de nuevo con /login en el bot.',
  'login.success_title': '¡Cuenta conectada! 🎉',
  'login.success_text':
    'Tu Last.fm quedó vinculado a FreshBeat. Vuelve a Telegram y usa /playingnow.',
  'login.expired':
    'Este enlace de conexión caducó o ya fue usado. Genera uno nuevo con /login en el bot.',
}

const catalogs: Record<Locale, Record<WebMessageKey, string>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'ja-JP': jaJP,
  'es-ES': esES,
}

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** Traduz uma chave do site com interpolação {{var}}. */
export function t(
  locale: Locale,
  key: WebMessageKey,
  vars: Record<string, string | number> = {},
): string {
  const template = catalogs[locale][key] ?? ptBR[key]
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : match,
  )
}
