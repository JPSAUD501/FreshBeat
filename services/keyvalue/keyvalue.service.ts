import type { DBService } from '../db/db.service.ts'
import { eq } from 'drizzle-orm'
import { keyvalueTable } from '../db/schema.ts'

export class KeyvalueService {
  private readonly table = keyvalueTable

  constructor(
    private readonly dbService: DBService,
  ) {}

  async findOneById(id: number) {
    const queryResult = await this.dbService.db.select().from(this.table).where(eq(this.table.id, id)).execute()
    if (queryResult.length === 0) return null
    return queryResult[0]
  }

  async findOneByKey(key: string) {
    const queryResult = await this.dbService.db.select().from(this.table).where(eq(this.table.key, key)).execute()
    if (queryResult.length === 0) return null
    return queryResult[0]
  }

  async create(props: typeof this.table.$inferInsert) {
    const result = await this.dbService.db.insert(this.table).values(props).returning({ id: this.table.id })
    const created = await this.findOneById(result[0].id)
    if (created === null) throw new Error('Failed to create keyvalue')
    return created
  }

  async update(id: number, props: Partial<typeof this.table.$inferInsert>) {
    await this.dbService.db.update(this.table).set(props).where(eq(this.table.id, id)).execute()
    return await this.findOneById(id)
  }
}
