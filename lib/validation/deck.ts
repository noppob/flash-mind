import { z } from "zod"

export const DECK_TEMPLATES = ["スタンダード", "英単語拡張", "詳細解説付き"] as const

export const CreateDeckSchema = z.object({
  name: z.string().min(1).max(80),
  template: z.enum(DECK_TEMPLATES).default("スタンダード"),
  color: z.string().min(1).max(40).default("bg-blue-500"),
})

export const UpdateDeckSchema = CreateDeckSchema.partial()

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
