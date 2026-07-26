/**
 * Catálogo base em pt-BR. É a fonte de verdade das chaves —
 * os demais idiomas são tipados a partir daqui, então o type-check
 * garante que nenhum idioma fica sem tradução.
 *
 * Placeholders usam a sintaxe {{variavel}}.
 */
export const ptBR = {
  // Geral
  'common.loading': '⏳ Carregando…',
  'common.error_with_code':
    '😕 Algo deu errado por aqui. Nossa equipe já foi avisada!\n\nCódigo do erro: <code>/support_error_{{errorId}}</code>',
  'common.rate_limited': '🐌 Calma aí! Tente de novo em {{seconds}}s.',

  // Descrições dos comandos (setMyCommands) — nomes ficam em inglês, descrições traduzem
  'cmd.start.description': 'Boas-vindas ao FreshBeat',
  'cmd.help.description': 'Ver tudo que eu sei fazer',
  'cmd.login.description': 'Conectar sua conta do Last.fm',
  'cmd.forgetme.description': 'Desvincular e apagar seus dados',

  // /start
  'start.welcome':
    '🎧 Olá, {{name}}! Eu sou o <b>FreshBeat</b>, seu companheiro de música.\n\nEu mostro o que você está ouvindo no Last.fm, busco letras e explico o significado das suas músicas favoritas.\n\nUse /help para ver tudo que eu sei fazer.',
  'start.welcome_back': '🎧 Que bom te ver de novo, {{name}}! Use /help para ver os comandos.',

  // /help
  'help.text':
    '📖 <b>O que eu sei fazer:</b>\n\n' +
    '/playingnow — o que você está ouvindo agora\n' +
    '/lyrics — letra da música que está tocando\n' +
    '/history — suas últimas faixas\n' +
    '/brief — resumo do seu perfil musical\n' +
    '/login — conectar sua conta do Last.fm\n' +
    '/forgetme — desvincular e apagar seus dados\n' +
    '/help — esta mensagem',

  // /login
  'login.already_linked':
    '✅ Sua conta do Last.fm já está conectada como <b>{{lastfmUser}}</b>.\n\nSe quiser trocar de conta, use /forgetme primeiro.',
  'login.prompt':
    '🔗 Vamos conectar sua conta do Last.fm!\n\nToque no botão abaixo para autorizar. O link expira em {{minutes}} minutos.',
  'login.button': 'Conectar Last.fm',
  'login.success':
    '✅ Conta conectada! Seu Last.fm <b>{{lastfmUser}}</b> está vinculado ao FreshBeat.',
  'login.expired': '⏰ Esse link de conexão expirou. Use /login para gerar um novo.',

  // /forgetme
  'forgetme.not_linked': 'Você não tem uma conta do Last.fm conectada.',
  'forgetme.done':
    '🧹 Pronto! Desvinculei sua conta do Last.fm e apaguei seus dados.\n\nSe quiser voltar, é só usar /login.',

  // Conta Last.fm necessária
  'lastfm.not_linked':
    '🔒 Para usar este comando você precisa conectar sua conta do Last.fm primeiro.\n\nUse /login — leva menos de um minuto!',

  // /playingnow
  'playingnow.not_listening': '🔇 Você não está ouvindo nada no momento (segundo o Last.fm).',
  'playingnow.now': '🎧 Ouvindo agora',
  'playingnow.was': '🕐 Estava ouvindo',

  // /lyrics
  'lyrics.not_found': '😕 Não encontrei a letra de <b>{{track}}</b> — {{artist}}.',
  'lyrics.source': 'fonte: {{source}}',
  'lyrics.translate_button': '🌐 Traduzir',
} as const

export type MessageKey = keyof typeof ptBR
/** Todas as chaves da base, com valores livres — tipo que os demais idiomas implementam. */
export type BaseMessages = Record<MessageKey, string>
