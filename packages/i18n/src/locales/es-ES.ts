import type { BaseMessages } from './pt-BR.js'

export const esES: BaseMessages = {
  'common.loading': '⏳ Cargando…',
  'common.error_with_code':
    '😕 Algo salió mal por aquí. ¡Nuestro equipo ya fue avisado!\n\nCódigo del error: <code>/support_error_{{errorId}}</code>',
  'common.rate_limited': '🐌 ¡Más despacio! Inténtalo de nuevo en {{seconds}}s.',

  'cmd.start.description': 'Bienvenido a FreshBeat',
  'cmd.help.description': 'Ver todo lo que sé hacer',
  'cmd.login.description': 'Conectar tu cuenta de Last.fm',
  'cmd.forgetme.description': 'Desvincular y borrar tus datos',
  'cmd.lyrics.description': 'Letra de la canción que suena',

  'start.welcome':
    '🎧 ¡Hola, {{name}}! Soy <b>FreshBeat</b>, tu compañero de música.\n\nTe muestro lo que estás escuchando en Last.fm, busco letras y explico el significado de tus canciones favoritas.\n\nUsa /help para ver todo lo que sé hacer.',
  'start.welcome_back': '🎧 ¡Qué bueno verte de nuevo, {{name}}! Usa /help para ver los comandos.',

  'help.text':
    '📖 <b>Lo que sé hacer:</b>\n\n' +
    '/playingnow — lo que estás escuchando ahora\n' +
    '/lyrics — letra de la canción que suena\n' +
    '/history — tus últimas canciones\n' +
    '/brief — resumen de tu perfil musical\n' +
    '/login — conectar tu cuenta de Last.fm\n' +
    '/forgetme — desvincular y borrar tus datos\n' +
    '/help — este mensaje',

  'login.already_linked':
    '✅ Tu cuenta de Last.fm ya está conectada como <b>{{lastfmUser}}</b>.\n\nSi quieres cambiar de cuenta, usa /forgetme primero.',
  'login.prompt':
    '🔗 ¡Vamos a conectar tu cuenta de Last.fm!\n\nToca el botón de abajo para autorizar. El enlace caduca en {{minutes}} minutos.',
  'login.button': 'Conectar Last.fm',
  'login.success': '✅ ¡Conectado! Tu Last.fm <b>{{lastfmUser}}</b> está vinculado a FreshBeat.',
  'login.expired': '⏰ Este enlace de conexión caducó. Usa /login para generar uno nuevo.',

  'forgetme.not_linked': 'No tienes una cuenta de Last.fm conectada.',
  'forgetme.done':
    '🧹 ¡Listo! Desvinculé tu cuenta de Last.fm y borré tus datos.\n\nSi quieres volver, solo usa /login.',

  'lastfm.not_linked':
    '🔒 Para usar este comando primero necesitas conectar tu cuenta de Last.fm.\n\nUsa /login — ¡tarda menos de un minuto!',

  'playingnow.not_listening': '🔇 No estás escuchando nada ahora mismo (según Last.fm).',
  'playingnow.now': '🎧 Escuchando ahora',
  'playingnow.was': '🕐 Estaba escuchando',

  'lyrics.not_found': '😕 No encontré la letra de <b>{{track}}</b> — {{artist}}.',
  'lyrics.source': 'fuente: {{source}}',
  'lyrics.translate_button': '🌐 Traducir',
  'lyrics.usage': '💡 Usa /lyrics para la letra de lo que suena, o /lyrics artista - canción.',
  'lyrics.instrumental': '🎼 <b>{{track}}</b> — {{artist}} es una pista instrumental.',
  'lyrics.translating': '🌐 Traduciendo…',
  'lyrics.state_expired': '⏰ Esta letra caducó. Pídela de nuevo con /lyrics.',
  'lyrics.auto_translated': 'traducción automática',
}
