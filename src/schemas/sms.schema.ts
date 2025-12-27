import { z } from 'zod'

const phoneRegex = /^\+?[\d\s\-()]+$/

export const smsSchema = z.object({
  to: z.string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format')
    .refine(
      (val) => val.replace(/[\s\-()]/g, '').length >= 10,
      'Phone number must have at least 10 digits'
    ),
  message: z.string()
    .min(1, 'Message is required')
})

export type SmsConfig = z.infer<typeof smsSchema>