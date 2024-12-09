import { ModelsService } from '../../models.service.ts'

export class SanaService extends ModelsService {
  constructor(apiToken: string) {
    super(apiToken, 'nvidia/sana')
  }

  async imagine(prompt: string): Promise<ArrayBuffer> {
    const prediction = await this.createPrediction({
      prompt,
      width: 1024,
      height: 1024,
      model_variant: '1600M-1024px',
      guidance_scale: 5,
      negative_prompt: '',
      pag_guidance_scale: 2,
      num_inference_steps: 18,
    }, 'c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6')
    const outputs = await this.waitForPrediction(prediction, 150000)
    let output
    if (!Array.isArray(outputs)) {
      output = outputs
    }
    return await this.fetchImage(output ?? outputs[0])
  }
}
