import type { FreshBeatUser } from '@freshbeat/database'

/**
 * Usuário do FreshBeat (espelha a tabela `users`, sem detalhes de banco).
 * Alias da entidade compartilhada com o site — o repositório Drizzle
 * também é compartilhado (@freshbeat/database).
 */
export type User = FreshBeatUser
