import { Auth } from './auth/auth.service.ts'
import { Preview } from './preview/preview.service.ts'
import { Search } from './search/search.service.ts'

export class SoundCloudService {
  public auth: Auth
  public search: Search
  public preview: Preview

  constructor() {
    this.auth = new Auth()
    this.search = new Search(this.auth)
    this.preview = new Preview(this.search, this.auth)
  }
}
