import { z } from 'zod'

export const transformSchema = z.object({
  script: z.string()
    .min(1, 'JavaScript code is required')
})

export type TransformConfig = z.infer<typeof transformSchema>