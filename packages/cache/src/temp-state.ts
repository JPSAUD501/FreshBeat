import { randomBytes } from 'node:crypto'
import type { CacheStore } from './port.js'

/**
 * Estado temporário de uso único (ex.: fluxos de OAuth / vinculação de conta).
 * Substitui o antigo KeyvalueService + sleeps: o estado expira sozinho (TTL)
 * e `consume` garante que cada token só pode ser usado uma vez.
 */
export class TempStateStore {
  constructor(private readonly cache: CacheStore) {}

  /** Cria um token aleatório apontando para o payload, com TTL. Retorna o token. */
  async create<T>(namespace: string, payload: T, ttlSeconds: number): Promise<string> {
    const token = randomBytes(24).toString('base64url')
    await this.cache.set(`${namespace}:${token}`, payload, { ttlSeconds })
    return token
  }

  /** Lê e apaga o estado (uso único). Undefined se expirado/inexistente. */
  async consume<T>(namespace: string, token: string): Promise<T | undefined> {
    return this.cache.consume<T>(`${namespace}:${token}`)
  }

  /** Lê sem apagar (para checagens intermediárias). */
  async peek<T>(namespace: string, token: string): Promise<T | undefined> {
    return this.cache.get<T>(`${namespace}:${token}`)
  }
}
