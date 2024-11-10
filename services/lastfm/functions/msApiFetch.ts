import { z } from 'zod'
import { ApiErrors } from '../types/errors/ApiErrors'

export async function msApiFetch<T>(url: string, schema: z.ZodSchema<T>): Promise<{ success: true; data: T } | ApiErrors> {
  try {
    const response = await fetch(url)
    const data = await response.json()
    const parsed = schema.safeParse(data)
    if (parsed.success) {
      return { success: true, data: parsed.data }
    } else {
      return { success: false, errorType: 'validationError', errorData: parsed.error }
    }
  } catch (error) {
    return { success: false, errorType: 'fetchError', errorData: error }
  }
}
