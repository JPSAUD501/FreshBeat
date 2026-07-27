import {
  createRedisClient,
  RedisCacheStore,
  TempStateStore,
  type CacheStore,
} from '@freshbeat/cache'
import { loadConfig, type Config } from '@freshbeat/config'
import { createDatabase, DrizzleUserRepository, type DatabaseConnection } from '@freshbeat/database'

/**
 * Singletons server-side (rotas de API e route handlers).
 * Lazy para não exigir env em build/dev de páginas estáticas.
 * Em serverless cada instância mantém seus próprios — aceitável.
 */
let config: Config | null = null
export function getConfig(): Config {
  config ??= loadConfig()
  return config
}

let cacheStore: RedisCacheStore | null = null
export function getCacheStore(): CacheStore {
  if (cacheStore === null) {
    const redis = createRedisClient(getConfig().redis.REDIS_URL)
    cacheStore = new RedisCacheStore(redis)
  }
  return cacheStore
}

let tempStateStore: TempStateStore | null = null
export function getTempStateStore(): TempStateStore {
  tempStateStore ??= new TempStateStore(getCacheStore())
  return tempStateStore
}

let connection: DatabaseConnection | null = null
export function getUserRepository(): DrizzleUserRepository {
  connection ??= createDatabase(getConfig().database.DATABASE_URL)
  return new DrizzleUserRepository(connection.db)
}
