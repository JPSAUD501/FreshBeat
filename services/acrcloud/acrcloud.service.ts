import { Identify } from './identify/identify.service.ts'

export class AcrCloudService {
  readonly identify: Identify

  constructor(props: { apiKey: string; apiSecret: string }) {
    this.identify = new Identify(props.apiKey, props.apiSecret)
  }
}
