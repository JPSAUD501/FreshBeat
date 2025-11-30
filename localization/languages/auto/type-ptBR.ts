export type BaseLang =
  | { key: 'error_with_code'; value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o suporte clicando em: /support_error_{{error_id}}' }
  | { key: 'forgetme_command_description'; value: 'Desvincular conta do Last.fm.' }
  | { key: 'forgetme_command_no_account_linked'; value: 'Não encontrei nenhuma conta Last.fm vinculada ao seu perfil. Parece que você já mandou eu esquecer antes ou nunca vinculou uma. Se quiser vincular uma nova conta, clique no botão abaixo.' }
  | { key: 'forgetme_command_success'; value: 'Sua conta Last.fm foi desvinculada com sucesso. Se quiser vincular outra conta, clique no botão abaixo.' }
  | { key: 'help_command_description'; value: 'Mostrar ajuda e informações sobre o bot.' }
  | { key: 'two_letter_iso_lang_code'; value: 'pt' }
  | { key: 'help_command_description_text'; value: 'Aqui está uma lista com os comandos disponíveis:' }
  | { key: 'start_command_description'; value: 'Bem vindo ao FreshBeat!' }
  | { key: 'start_command_first_time'; value: 'Olá! Que prazer em te conhecer <a href="tg://user?id={{user_id}}">{{user_name}}</a>! Tudo bem?!' }
  | { key: 'start_command_what_i_do'; value: 'Eu sou o FreshBeat! Te ajudo a acompanhar sua vida musical junto com o Last.fm e utilizo inteligência artificial para criar novas experiências musicais para você!' }
  | { key: 'start_command_lastfm_account_already_linked'; value: 'Oi! Verifiquei aqui e vi que você já vinculou sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm ao FreshBeat! Se quiser vincular outra conta, basta clicar no botão abaixo!' }
  | { key: 'start_command_link_lastfm_account_keyboard_button'; value: 'Vincular Last.fm!' }
  | { key: 'new_lastfm_account_linked_ok'; value: 'Vincular Spotify' }
  | { key: 'lastfm_new_account_inform'; value: 'Estou finalizando a vinculação da sua nova conta ao FreshBeat! Não esqueça de clicar no botão abaixo para conectar sua conta do Spotify ao seu perfil do Last.fm enquanto termino de preparar tudo para você!' }
  | { key: 'lastfm_account_linked_ok'; value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm foi vinculada com sucesso! Agora você tem acesso a todas as funcionalidades do FreshBeat! Tente usar o botão abaixo para conferi-las! 🎉' }
  | { key: 'start_command_from_another_chat_inform'; value: 'Te trouxe aqui rapidinho por questões de privacidade! Assim que terminar de vincular sua conta do Last.fm você pode voltar ao chat <b>{{from_chat_tittle}}</b> sem problemas!' }
  | { key: 'start_command_link_lastfm_account'; value: 'Vincule sua conta do telegram <a href="tg://user?id={{user_id}}">{{user_name}}</a> com o Last.fm! Clique no botão abaixo para continuar!' }
  | { key: 'start_command_no_lastfm_account'; value: 'Para ter acesso a todas as funcionalidades do FreshBeat, você precisa vincular sua conta do Last.fm! Se você ainda não tem uma conta, fique tranquilo! Será possível criar ela na pagina de login!' }
  | { key: 'start_command_no_lastfm_account_non_private_chat'; value: 'Por questões de privacidade, vou te puxar rapidinho para uma conversa privada. Clique no botão abaixo e em seguida em "Iniciar"!' }
  // Playing Now translations
  | { key: 'playing_now_command_description'; value: 'Mostrar o que você está ouvindo agora.' }
  | { key: 'playing_now_link_lastfm_button'; value: 'Vincular Last.fm' }
  | { key: 'playing_now_no_lastfm_account'; value: 'Você precisa vincular sua conta do Last.fm primeiro! Clique no botão abaixo para começar.' }
  | { key: 'playing_now_no_recent_tracks'; value: 'Parece que você ainda não ouviu nenhuma música no Last.fm! Que tal começar a ouvir algo agora?' }
  | { key: 'playing_now_header_now_playing'; value: '<b><a href="{{userUrl}}">{{username}}</a> está ouvindo</b>' }
  | { key: 'playing_now_header_last_track'; value: '<b><a href="{{userUrl}}">{{username}}</a> estava ouvindo</b>' }
  | { key: 'playing_now_track_with_artist_info'; value: '<b>[🎧{{badge}}]</b> <a href="{{trackUrl}}"><b>{{trackName}}</b> por </a><a href="{{artistUrl}}"><b>{{artistName}}</b></a>' }
  | { key: 'playing_now_album_name'; value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }
  | { key: 'playing_now_scrobbles_title'; value: '<b>[📊] Scrobbles</b>' }
  | { key: 'locale_lang_code'; value: 'pt-BR' }
  | { key: 'playing_now_track_scrobbles'; value: '- Música: <b>{{trackPlaycount}}</b>' }
  | { key: 'playing_now_album_scrobbles'; value: '- Álbum: <b>{{albumPlaycount}}</b>' }
  | { key: 'playing_now_artist_scrobbles'; value: '- Artista: <b>{{artistPlaycount}}</b>' }
  | { key: 'playing_now_info_title'; value: '<b>[ℹ️] Informações</b>' }
  | { key: 'playing_now_info_track_playtime'; value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' }
  | { key: 'playing_now_info_track_popularity'; value: '- Popularidade no Spotify: <b>[{{popularity}}][{{stars}}]</b>' }
  | { key: 'playing_now_info_track_album_percentage'; value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse álbum.' }
  | { key: 'playing_now_info_track_artist_percentage'; value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }
  | { key: 'playing_now_info_album_artist_percentage'; value: '- Esse álbum representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }
  | { key: 'playing_now_info_artist_user_percentage'; value: '- Esse artista representa <b>{{percentage}}%</b> de todas suas reproduções.' }
  | { key: 'playing_now_spotify_button'; value: '[🎧] Spotify' }
  | { key: 'playing_now_deezer_button'; value: '[🎧] Deezer' }
  | { key: 'playing_now_lastfm_button'; value: '[📊] Last.fm' }
