import { z } from 'zod'

export const emailSchema = z.object({
  to: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z.string()
    .min(1, 'Subject is required'),
  body: z.string()
    .min(1, 'Email body is required')
})

export type EmailConfig = z.infer<typeof emailSchema>