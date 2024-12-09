import { FluxService } from './models/flux/flux.service.ts'
import { config } from '../../config.ts'
import { SanaService } from './models/sana/sana.service.ts'

export class ReplicateService {
  readonly flux: FluxService
  readonly sana: SanaService

  constructor() {
    this.flux = new FluxService(config.REPLICATE_API_TOKEN)
    this.sana = new SanaService(config.REPLICATE_API_TOKEN)
  }
}
