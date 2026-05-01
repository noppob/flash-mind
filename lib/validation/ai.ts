import { z } from "zod"

export const AiGenerateSchema = z.object({
  word: z.string().min(1).max(120),
})

export const AiGenerateResultSchema = z.object({
  meaning: z.string(),
  example: z.string(),
  etymology: z.string(),
  explanation: z.string(),
})

export type AiGenerateInput = z.infer<typeof AiGenerateSchema>
export type AiGenerateResult = z.infer<typeof AiGenerateResultSchema>
