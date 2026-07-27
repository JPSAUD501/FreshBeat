import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDatabase, type DatabaseConnection } from './index.js'
import { DrizzleUserRepository } from './user-repository.js'

/**
 * Integração com Postgres real — opt-in via DATABASE_URL.
 * Roda com `npm run test:integration` (stack docker no ar).
 */
const DATABASE_URL = process.env.DATABASE_URL
const describeIntegration = DATABASE_URL === undefined ? describe.skip : describe

// ID exclusivo desses testes — nunca colide com dados reais/QA.
const TEST_TELEGRAM_ID = 989000001

describeIntegration('DrizzleUserRepository (integração)', () => {
  let connection: DatabaseConnection
  let repository: DrizzleUserRepository

  beforeAll(async () => {
    connection = createDatabase(DATABASE_URL!)
    repository = new DrizzleUserRepository(connection.db)
    // Garante estado limpo mesmo se uma rodada anterior morreu no meio
    await repository.delete(TEST_TELEGRAM_ID)
    await repository.create(TEST_TELEGRAM_ID)
  })

  afterAll(async () => {
    await repository.delete(TEST_TELEGRAM_ID)
    await connection.close()
  })

  it('create + findByTelegramId', async () => {
    const user = await repository.findByTelegramId(TEST_TELEGRAM_ID)
    expect(user).not.toBeNull()
    expect(user?.telegramUserId).toBe(TEST_TELEGRAM_ID)
    expect(user?.lastfmUsername).toBeNull()
    expect(user?.preferredLocale).toBeNull()
    expect(user?.telegramLocale).toBeNull()
  })

  it('touchTelegramLocale persiste o idioma detectado', async () => {
    await repository.touchTelegramLocale(TEST_TELEGRAM_ID, 'pt')
    expect((await repository.findByTelegramId(TEST_TELEGRAM_ID))?.telegramLocale).toBe('pt')
    await repository.touchTelegramLocale(TEST_TELEGRAM_ID, 'en')
    expect((await repository.findByTelegramId(TEST_TELEGRAM_ID))?.telegramLocale).toBe('en')
  })

  it('setPreferredLocale define e limpa a preferência', async () => {
    await repository.setPreferredLocale(TEST_TELEGRAM_ID, 'ja-JP')
    expect((await repository.findByTelegramId(TEST_TELEGRAM_ID))?.preferredLocale).toBe('ja-JP')
    await repository.setPreferredLocale(TEST_TELEGRAM_ID, null)
    expect((await repository.findByTelegramId(TEST_TELEGRAM_ID))?.preferredLocale).toBeNull()
  })

  it('delete remove o usuário', async () => {
    const tempId = 989000002
    await repository.delete(tempId) // limpeza preventiva
    await repository.create(tempId)
    await repository.delete(tempId)
    expect(await repository.findByTelegramId(tempId)).toBeNull()
  })
})
