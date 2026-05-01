import { api } from "./client"
import type { AiGenerateResult } from "@/lib/validation/ai"

export type AiGenerateInput = {
  word: string
}

export const generateAi = (input: AiGenerateInput) =>
  api.post<AiGenerateResult>("/api/ai/generate", input)

export type LookupWordResult = {
  word: string
  meaning: string
  source?: "dictionary" | "ai+dictionary" | "ai"
}

export const lookupWord = (word: string, sentence?: string) =>
  api.post<LookupWordResult>("/api/ai/lookup", { word, sentence })
