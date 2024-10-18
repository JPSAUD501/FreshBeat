import { DenoKVService } from '../denokv/denokv.service.ts'

export class UsersService {
  private readonly repository: string = 'users'
  private readonly denokv: Deno.Kv

  constructor() {
    this.denokv = new DenoKVService().getClient()
  }
}
