import { Auth } from './auth/auth.service.ts'
import { User } from './user/user.service.ts'

export class LastFmService {
  private readonly apiKey: string
  private readonly apiSecret: string
  readonly auth: Auth
  readonly user: User

  constructor(props: { apiKey: string; apiSecret: string }) {
    this.apiKey = props.apiKey
    this.apiSecret = props.apiSecret
    this.auth = new Auth(this.apiKey, this.apiSecret)
    this.user = new User(this.apiKey)
  }
}
