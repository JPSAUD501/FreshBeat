import { DenoKVService } from '../denokv/denokv.service.ts'

export class UsersService {
  private readonly repository: string = 'users'

  constructor(
    private readonly denokvService = new DenoKVService(),
  ) {}
}
