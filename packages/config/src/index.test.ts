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

  it('modelos de IA caem no default minimax/minimax-m3 e são configuráveis', () => {
    const onlyKey = loadConfig({ ...validCoreEnv, OPENROUTER_API_KEY: 'key' })
    expect(onlyKey.ai?.AI_MODEL_EXPLAIN).toBe('minimax/minimax-m3')
    expect(onlyKey.ai?.AI_MODEL_TRANSLATE).toBe('minimax/minimax-m3')
    expect(onlyKey.ai?.AI_MODEL_IMAGE_PROMPT).toBe('minimax/minimax-m3')
    expect(onlyKey.ai?.AI_MODEL_ALT_TEXT).toBe('minimax/minimax-m3')

    const custom = loadConfig({
      ...validCoreEnv,
      OPENROUTER_API_KEY: 'key',
      AI_MODEL_EXPLAIN: 'model-a',
    })
    expect(custom.ai?.AI_MODEL_EXPLAIN).toBe('model-a')
    expect(custom.ai?.AI_MODEL_TRANSLATE).toBe('minimax/minimax-m3')
  })

  it('modelo de imagem do Replicate cai no default prunaai/p-image', () => {
    const onlyToken = loadConfig({ ...validCoreEnv, REPLICATE_API_TOKEN: 'token' })
    expect(onlyToken.replicate?.REPLICATE_IMAGE_MODEL).toBe('prunaai/p-image')

    const custom = loadConfig({
      ...validCoreEnv,
      REPLICATE_API_TOKEN: 'token',
      REPLICATE_IMAGE_MODEL: 'acme/outro-modelo',
    })
    expect(custom.replicate?.REPLICATE_IMAGE_MODEL).toBe('acme/outro-modelo')
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
