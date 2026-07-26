/**
 * Port de cache. Implementações: RedisCacheStore (produção) e
 * InMemoryCacheStore (testes/dev). Valores são serializados em JSON.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, options?: { ttlSeconds?: number }): Promise<void>
  delete(key: string): Promise<void>
  /** Retorna o valor e remove a chave atomicamente (fluxos de uso único). */
  consume<T>(key: string): Promise<T | undefined>
}

/** Busca no cache; em miss, executa `loader`, armazena e retorna. */
export async function getOrSet<T>(
  cache: CacheStore,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await cache.get<T>(key)
  if (cached !== undefined) return cached
  const value = await loader()
  await cache.set(key, value, { ttlSeconds })
  return value
}

/** Monta chave de cache namespaced e estável a partir de partes. */
export function cacheKey(namespace: string, ...parts: (string | number)[]): string {
  const normalized = parts.map((part) => String(part).trim().toLowerCase().replace(/\s+/g, ' '))
  return `${namespace}:${normalized.join(':')}`
}
