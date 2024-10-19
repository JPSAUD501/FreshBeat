import type { DBService } from '../db/db.service.ts'
import { userTable } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export class UsersService {
  private readonly table = userTable

  constructor(
    private readonly dbService: DBService,
  ) {}

  async findOneById(id: number) {
    const queryResult = await this.dbService.db.select().from(this.table).where(eq(this.table.id, id)).execute()
    if (queryResult.length === 0) return null
    return queryResult[0]
  }

  async findOneByTelegramId(telegramId: number) {
    const queryResult = await this.dbService.db.select({ id: this.table.id }).from(this.table).where(eq(this.table.telegram_id, telegramId)).execute()
    if (queryResult.length === 0) return null
    return this.findOneById(queryResult[0].id)
  }

  async create(props: typeof this.table.$inferInsert) {
    const result = await this.dbService.db.insert(this.table).values(props).returning({ id: this.table.id })
    const created = await this.findOneById(result[0].id)
    if (created === null) throw new Error('Failed to create user')
    return created
  }

  async update(id: number, props: Partial<typeof this.table.$inferInsert>) {
    await this.dbService.db.update(this.table).set(props).where(eq(this.table.id, id)).execute()
    return this.findOneById(id)
  }
}
