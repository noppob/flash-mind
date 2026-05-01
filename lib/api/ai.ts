import { api } from "./client"
import type { AiGenerateKindT } from "@/lib/validation/ai"

export type AiGenerateInput = {
  kind: AiGenerateKindT
  word: string
  meaning?: string
}

export const generateAi = (input: AiGenerateInput) =>
  api.post<{ result: string }>("/api/ai/generate", input)

export const lookupWord = (word: string, sentence?: string) =>
  api.post<{ word: string; meaning: string }>("/api/ai/lookup", {
    word,
    sentence,
  })
