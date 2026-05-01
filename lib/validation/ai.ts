import { z } from "zod"

export const AiGenerateKind = z.enum(["meaning", "etymology", "explanation"])

export const AiGenerateSchema = z.object({
  kind: AiGenerateKind,
  word: z.string().min(1).max(120),
  meaning: z.string().max(400).optional(),
})

export type AiGenerateInput = z.infer<typeof AiGenerateSchema>
export type AiGenerateKindT = z.infer<typeof AiGenerateKind>
