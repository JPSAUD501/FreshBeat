import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig, requireGroup } from './index.js'

const validCoreEnv = {
  BOT_TOKEN: 'token',
  BOT_USERNAME: 'freshbeat_bot',
  DATABASE_URL: 'postgres://user:pass@localhost:5432/freshbeat',
  REDIS_URL: 'redis://localhost:6379',
  LASTFM_API_KEY: 'key',
  LASTFM_API_SECRET: 'secret',
  WEB_BASE_URL: 'http://localhost:3000',
  WEB_SESSION_SECRET: 'a'.repeat(32),
}

describe('loadConfig', () => {
  it('carrega config válida com grupos opcionais ausentes', () => {
    const config = loadConfig(validCoreEnv)
    expect(config.telegram.BOT_TOKEN).toBe('token')
    expect(config.logging.LOG_LEVEL).toBe('info')
    expect(config.ai).toBeUndefined()
    expect(config.spotify).toBeUndefined()
  })

  it('falha rápido quando variável obrigatória está ausente', () => {
    const { BOT_TOKEN: _removed, ...env } = validCoreEnv
    expect(() => loadConfig(env)).toThrow(ConfigError)
  })

  it('falha rápido quando variável obrigatória está vazia', () => {
    expect(() => loadConfig({ ...validCoreEnv, BOT_TOKEN: '' })).toThrow(ConfigError)
  })

  it('exige grupo opcional completo quando qualquer chave está presente', () => {
    expect(() => loadConfig({ ...validCoreEnv, OPENROUTER_API_KEY: 'key' })).toThrow(ConfigError)

    const config = loadConfig({
      ...validCoreEnv,
      OPENROUTER_API_KEY: 'key',
      AI_MODEL_EXPLAIN: 'model-a',
      AI_MODEL_TRANSLATE: 'model-b',
      AI_MODEL_IMAGE_PROMPT: 'model-c',
    })
    expect(config.ai?.AI_MODEL_EXPLAIN).toBe('model-a')
  })

  it('valida formato de URL', () => {
    expect(() => loadConfig({ ...validCoreEnv, DATABASE_URL: 'not-a-url' })).toThrow(ConfigError)
  })

  it('exige WEB_SESSION_SECRET com pelo menos 32 caracteres', () => {
    expect(() => loadConfig({ ...validCoreEnv, WEB_SESSION_SECRET: 'curto' })).toThrow(ConfigError)
  })

  it('inclui o nome do grupo no caminho do erro', () => {
    try {
      loadConfig({ ...validCoreEnv, BOT_TOKEN: '' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError)
      expect((error as ConfigError).issues[0]?.path[0]).toBe('telegram')
    }
  })
})

describe('requireGroup', () => {
  it('retorna o grupo quando presente', () => {
    expect(requireGroup({ a: 1 }, 'ai')).toEqual({ a: 1 })
  })

  it('lança ConfigError quando ausente', () => {
    expect(() => requireGroup(undefined, 'ai')).toThrow(ConfigError)
  })
})
