import type { DBService } from '../db/db.service.ts'
import { errorTable } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export class ErrorsService {
  private readonly table = errorTable

  constructor(
    private readonly dbService: DBService,
  ) {}

  async findOneById(id: number) {
    const queryResult = await this.dbService.db.select().from(this.table).where(eq(this.table.id, id)).execute()
    if (queryResult.length === 0) return null
    return queryResult[0]
  }

  async create(props: typeof this.table.$inferInsert) {
    const result = await this.dbService.db.insert(this.table).values(props).returning({ id: this.table.id })
    const created = await this.findOneById(result[0].id)
    if (created === null) throw new Error('Failed to create error')
    return created
  }
}
