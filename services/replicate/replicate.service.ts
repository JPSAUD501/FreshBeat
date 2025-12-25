import { config } from '../../config.ts'
import { ZImageUltraService } from './models/z-image-ultra/z-image-ultra.service.ts'

export class ReplicateService {
  readonly zImageUltra: ZImageUltraService

  constructor() {
    this.zImageUltra = new ZImageUltraService(config.REPLICATE_API_TOKEN)
  }
}
