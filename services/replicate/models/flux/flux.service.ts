import { ModelsService } from '../../models.service.ts'

export class FluxService extends ModelsService {
  constructor(apiToken: string) {
    super(apiToken, 'black-forest-labs/flux-schnell')
  }

  async imagine(prompt: string): Promise<ArrayBuffer> {
    const prediction = await this.createPrediction({
      prompt,
      go_fast: true,
      megapixels: '1',
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'jpg',
      output_quality: 80,
      num_inference_steps: 4,
    })
    const outputs = await this.waitForPrediction(prediction)
    let output
    if (!Array.isArray(outputs)) {
      output = outputs
    }
    return await this.fetchImage(output ?? outputs[0])
  }
}
