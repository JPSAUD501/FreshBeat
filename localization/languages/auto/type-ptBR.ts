export type BaseLang =
  | { key: 'tf_start_message'; value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }
  | { key: 'tf_help_description'; value: 'Mostra todos os comandos disponíveis' }
  | { key: 'tf_help_message'; value: 'Aqui estão todos os comandos disponíveis:' }
  | { key: 'tf_start_description'; value: 'Bem vindo ao FreshBeat!' }
  | { key: 'mf_help_message'; value: 'Aqui estão todos os comandos disponíveis:' }
  | { key: 'help_command_description'; value: 'Mostrar ajuda e informações sobre o bot.' }
  | { key: 'mf_start_message'; value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }
  | { key: 'start_command_description'; value: 'Bem vindo ao FreshBeat!' }
  | { key: 'start_non_private_chat_response'; value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' }
  | { key: 'start_private_chat_response'; value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' }
  | { key: 'start_private_chat_from_another_chat_response'; value: 'Olá! Você foi redirecionado do chat {{from_chat_tittle}}! Para vincular sua conta do Last.fm, clique no botão  que apareceu abaixo!' }
  | { key: 'start_command_error'; value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte forneça o código de erro: {{error_id}}' }
  | { key: 'start_command_first_time'; value: 'Olá! Que prazer em te conhecer <a href="tg://user?id={{user_id}}">{{user_name}}</a>! Tudo bem?!' }
  | { key: 'start_command_what_i_do'; value: 'Eu sou o FreshBeat! Te ajudo a acompanhar sua vida musical junto com o Last.fm e utilizo inteligência artificial para criar novas experiências musicais para você!' }
  | { key: 'start_command_no_lastfm_account'; value: 'Para ter acesso a todas as funcionalidades do FreshBeat, você precisa vincular sua conta do Last.fm! Se você ainda não tem uma conta, fique tranquilo! Será possível criar ela na pagina de login!' }
  | { key: 'start_command_no_lastfm_account_non_private_chat'; value: 'Por questões de privacidade, vou te puxar rapidinho para uma conversa privada. Clique no botão abaixo e em seguida em "Iniciar"!' }
  | { key: 'start_command_from_another_chat'; value: 'Te trouxe aqui rapidinho por questões de privacidade! Assim que terminar de vincular sua conta do Last.fm, utilize o botão abaixo para voltar ao chat <b>{{from_chat_tittle}}</b>!' }
  | { key: 'start_command_link_lastfm_account_keyboard_button'; value: 'Vincular Last.fm!' }
  | { key: 'start_command_link_lastfm_account'; value: 'Vincule sua conta do telegram <a href="tg://user?id={{user_id}}">{{user_name}}</a> com o Last.fm! Clique no botão abaixo para continuar!' }
  | { key: 'webapp_lastfm_account_linked'; value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> foi vinculada com sucesso!' }
  | { key: 'webapp_lastfm_account_linked_success'; value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm foi vinculada com sucesso! Agora você tem acesso a todas as funcionalidades do FreshBeat! 🎉\nTente usar o comando /help para conhecer algumas delas!' }
  | { key: 'start_command_lastfm_account_already_linked'; value: 'Oi! Verifiquei aqui e vi que você já vinculou sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm ao FreshBeat! Se quiser vincular outra conta, basta clicar no botão abaixo!' }
  | { key: 'start_command_from_another_chat_inform'; value: 'Te trouxe aqui rapidinho por questões de privacidade! Assim que terminar de vincular sua conta do Last.fm você pode voltar ao chat <b>{{from_chat_tittle}}</b> sem problemas!' }
  | { key: 'start_command_error_with_code'; value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte e forneça o código de erro: {{error_id}}' }
  | { key: 'forgetme_command_error_with_code'; value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte e forneça o código de erro: {{error_id}}' }
  | { key: 'forgetme_command_description'; value: 'Desvincular conta do Last.fm.' }
  | { key: 'forgetme_command_no_account_linked'; value: 'Não encontrei nenhuma conta Last.fm vinculada ao seu perfil. Parece que você já mandou eu esquecer antes ou nunca vinculou uma. Se quiser vincular uma nova conta, clique no botão abaixo.' }
  | { key: 'forgetme_command_success'; value: 'Sua conta Last.fm foi desvinculada com sucesso. Se quiser vincular outra conta, clique no botão abaixo.' }
  | { key: 'help_command_error_with_code'; value: 'Tive um problema enquanto processava sua solicitação! Por favor, tente novamente! Se o problema persistir, entre em contato com o /suporte e forneça o código de erro: {{error_id}}' }
  | { key: 'help_command_description_text'; value: 'Aqui está uma lista com os comandos disponíveis:' }
  | { key: 'two_letter_iso_lang_code'; value: 'pt' }
  | { key: 'webapp_lastfm_account_linked_ok'; value: 'Sua conta <a href="https://www.last.fm/user/{{lastfm_username}}">{{lastfm_username}}</a> do Last.fm foi vinculada com sucesso! Agora você tem acesso a todas as funcionalidades do FreshBeat! Tente usar o botão abaixo para conferi-las! 🎉' }
