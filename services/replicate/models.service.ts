interface PredictionResponse {
  urls: { get: string }
  status: string
  output: string[]
}

export abstract class ModelsService {
  private readonly API_BASE = 'https://api.replicate.com/v1'

  constructor(
    protected apiToken: string,
    protected modelId: string,
  ) {}

  protected async createPrediction(input: Record<string, unknown>, version?: string): Promise<PredictionResponse> {
    let url = `${this.API_BASE}/models/${this.modelId}/predictions`
    if (version !== undefined) {
      url = `${this.API_BASE}/predictions`
    }
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ version, input }),
    })
    return response.json()
  }

  protected async waitForPrediction(initialPrediction: PredictionResponse, timeout: number = 10000): Promise<string[] | string> {
    let prediction = initialPrediction
    const startTime = Date.now()

    while (!['succeeded', 'failed'].includes(prediction.status)) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Prediction timed out')
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      prediction = await this.makeRequest(initialPrediction.urls.get).then((res) => res.json())

      if (prediction.status === 'failed') {
        throw new Error('Image generation failed')
      }
    }

    return prediction.output
  }

  protected async fetchImage(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch generated image')
    return res.arrayBuffer()
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
        ...options.headers,
      },
    })

    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`)
    return response
  }
}
