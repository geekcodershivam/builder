import { z } from 'zod'

export const webhookSchema = z.object({
  url: z.string()
    .min(1, 'Webhook URL is required')
    .url('Please enter a valid URL'),
  method: z.enum(['POST', 'GET', 'PUT'])
})

export type WebhookConfig = z.infer<typeof webhookSchema>