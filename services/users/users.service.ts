import type { FindOneUserDto } from './dto/find.dto.ts'
import { ZodUser } from './user.type.ts'
import type { CreateUserDto } from './dto/create.dto.ts'
import type { UpdateUserDto } from './dto/update.dto.ts'
import { DenoKVService } from '../denokv/denokv.service.ts'

export class UsersService {
  private readonly repository: string = 'users'
  private readonly denokv: Deno.Kv

  constructor() {
    this.denokv = new DenoKVService().getClient()
  }

  async create(data: CreateUserDto): Promise<FindOneUserDto> {
    const uuid = crypto.randomUUID()
    const object = {
      uuid,
      ...data,
    }
    const parsed = ZodUser.parse(object)
    await this.denokv.set([this.repository, uuid], parsed)
    return await this.findOne(uuid)
  }

  async update(data: UpdateUserDto): Promise<FindOneUserDto> {
    const parsed = ZodUser.parse(data)
    await this.denokv.set([this.repository, parsed.uuid], parsed)
    return parsed
  }

  async findOne(uuid: string): Promise<FindOneUserDto> {
    const data = await this.denokv.get([this.repository, uuid])
    const parsed = ZodUser.parse(data)
    return parsed
  }

  async delete(uuid: string): Promise<void> {
    await this.denokv.delete([this.repository, uuid])
  }
}
