import type { User } from '../user.type.ts'

export interface UpdateUserDto extends Omit<Partial<User>, 'uuid'> {
  uuid: string
}
