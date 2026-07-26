import { createRedisClient, RedisCacheStore, TempStateStore } from '@freshbeat/cache'
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

let tempStateStore: TempStateStore | null = null
export function getTempStateStore(): TempStateStore {
  if (tempStateStore === null) {
    const redis = createRedisClient(getConfig().redis.REDIS_URL)
    tempStateStore = new TempStateStore(new RedisCacheStore(redis))
  }
  return tempStateStore
}

let connection: DatabaseConnection | null = null
export function getUserRepository(): DrizzleUserRepository {
  connection ??= createDatabase(getConfig().database.DATABASE_URL)
  return new DrizzleUserRepository(connection.db)
}
