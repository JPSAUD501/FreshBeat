/// <reference lib="deno.unstable" />
import type { FindOneUserDto } from './dto/find.dto.ts'
import { ZodUser } from './user.type.ts'
import type { CreateUserDto } from './dto/create.dto.ts'
import type { UpdateUserDto } from './dto/update.dto.ts'

const kv = await Deno.openKv()

export class UsersService {
  private readonly repository: string = 'users'

  async create(data: CreateUserDto): Promise<FindOneUserDto> {
    const uuid = crypto.randomUUID()
    const object = {
      uuid,
      ...data,
    }
    const parsed = ZodUser.parse(object)
    await kv.set([this.repository, uuid], parsed)
    return await this.findOne(uuid)
  }

  async update(data: UpdateUserDto): Promise<FindOneUserDto> {
    const parsed = ZodUser.parse(data)
    await kv.set([this.repository, parsed.uuid], parsed)
    return parsed
  }

  async findOne(uuid: string): Promise<FindOneUserDto> {
    const data = await kv.get([this.repository, uuid])
    const parsed = ZodUser.parse(data)
    return parsed
  }
}
