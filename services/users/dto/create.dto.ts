import type { User } from '../user.type.ts'

export interface CreateUserDto extends Omit<User, 'uuid'> {}
