import { z } from 'zod'

export const httpSchema = z.object({
  url: z.string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL (e.g., https://example.com)'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.string().optional(),
  body: z.string().optional()
})

export type HttpConfig = z.infer<typeof httpSchema>