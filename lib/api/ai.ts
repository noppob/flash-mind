import { api } from "./client"
import type { AiGenerateResult } from "@/lib/validation/ai"

export type AiGenerateInput = {
  word: string
}

export const generateAi = (input: AiGenerateInput) =>
  api.post<AiGenerateResult>("/api/ai/generate", input)

export const lookupWord = (word: string, sentence?: string) =>
  api.post<{ word: string; meaning: string }>("/api/ai/lookup", {
    word,
    sentence,
  })
