import { z } from 'zod'

export const delaySchema = z.object({
  duration: z
    .number()
    .positive('Duration must be positive')
    .min(1, 'Duration must be at least 1')
    .max(86400, 'Duration cannot exceed 24 hours (86400 seconds)'),
  
  unit: z
    .enum(['seconds', 'minutes', 'hours', 'days'], {
      errorMap: () => ({ message: 'Please select a valid time unit' })
    })
})

export type DelayConfig = z.infer<typeof delaySchema>

// Helper function to convert to seconds
export function convertToSeconds(duration: number, unit: string): number {
  const conversions: Record<string, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400
  }
  return duration * (conversions[unit] || 1)
}

// Helper function to format delay for display
export function formatDelay(duration: number, unit: string): string {
  if (duration === 1) {
    // Singular form
    return `${duration} ${unit.slice(0, -1)}`
  }
  return `${duration} ${unit}`
}