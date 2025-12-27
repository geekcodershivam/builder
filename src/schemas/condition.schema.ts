import { z } from 'zod'

export const conditionSchema = z.object({
  expression: z.string()
    .min(1, 'Expression is required'),
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional()
})

export type ConditionConfig = z.infer<typeof conditionSchema>