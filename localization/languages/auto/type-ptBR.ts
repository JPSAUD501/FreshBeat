export type BaseLang =
  | { key: 'tf_start_message'; value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }
  | { key: 'tf_help_description'; value: 'Mostra todos os comandos disponíveis' }
  | { key: 'tf_help_message'; value: 'Aqui estão todos os comandos disponíveis:' }
  | { key: 'tf_start_description'; value: 'Bem vindo ao FreshBeat!' }
  | { key: 'mf_help_message'; value: 'Aqui estão todos os comandos disponíveis:' }
  | { key: 'help_command_description'; value: 'Mostra todos os comandos disponíveis' }
  | { key: 'mf_start_message'; value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }
  | { key: 'start_command_description'; value: 'Bem vindo ao FreshBeat!' }
  | { key: 'start_non_private_chat_response'; value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' }
  | { key: 'start_private_chat_response'; value: 'Olá! Para vincular sua conta do Last.fm, clique no botão abaixo!' }
  | { key: 'start_private_chat_from_another_chat_response'; value: 'Olá! Você foi redirecionado do chat {{from_chat_tittle}}! Para vincular sua conta do Last.fm, clique no botão  que apareceu abaixo!' }
