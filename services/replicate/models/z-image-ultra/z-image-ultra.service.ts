import { ModelsService } from '../../models.service.ts'

export class ZImageUltraService extends ModelsService {
  constructor(apiToken: string) {
    super(apiToken, 'prunaai/z-image-turbo')
  }

  async imagine(prompt: string): Promise<ArrayBuffer> {
    const prediction = await this.createPrediction({
      width: 1024,
      height: 1024,
      prompt,
      output_format: 'jpg',
      guidance_scale: 0,
      output_quality: 100,
      num_inference_steps: 10,
    })
    const outputs = await this.waitForPrediction(prediction)
    let output
    if (!Array.isArray(outputs)) {
      output = outputs
    }
    return await this.fetchImage(output ?? outputs[0])
  }
}
