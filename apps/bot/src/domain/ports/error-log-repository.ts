export interface ErrorLogEntry {
  readonly telegramUserId: number | null
  /** Origem curta, ex.: "command:playingnow", "callback:lyrics". */
  readonly source: string
  readonly error: Error
}

/** Port de registro de erros apresentados como /support_error_{id}. */
export interface ErrorLogRepository {
  /** Persiste o erro e retorna o id público para o usuário. */
  log(entry: ErrorLogEntry): Promise<string>
}
