export interface SetWebhookRequesDto {
  webhook_path: string
}

export interface SetWebhookResponseDto {
  success: boolean
  old_webhook_url: string | null
  new_webhook_url: string | null
}
