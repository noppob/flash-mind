import { api } from "./client"
import type {
  DictionarySearchMode,
  DictionarySearchDirection,
  DictionarySearchResponse,
  ExtractWordsResponse,
} from "@/lib/validation/dictionary"

export type DictionarySearchParams = {
  q: string
  mode?: DictionarySearchMode
  direction?: DictionarySearchDirection
  limit?: number
  distinct?: boolean
}

export const searchDictionary = (params: DictionarySearchParams) => {
  const search = new URLSearchParams({ q: params.q })
  if (params.mode) search.set("mode", params.mode)
  if (params.direction) search.set("direction", params.direction)
  if (params.limit !== undefined) search.set("limit", String(params.limit))
  if (params.distinct !== undefined) search.set("distinct", String(params.distinct))
  return api.get<DictionarySearchResponse>(`/api/dictionary/search?${search}`)
}

export type ExtractWordsParams = {
  text: string
  deckId?: string
  limit?: number
}

export const extractUnknownWords = (params: ExtractWordsParams) =>
  api.post<ExtractWordsResponse>("/api/dictionary/extract-words", params)
