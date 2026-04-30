import { api } from "./client"
import type { PublicDeck } from "./types"

export const listPublicDecks = (opts: { category?: string; q?: string } = {}) => {
  const search = new URLSearchParams()
  if (opts.category) search.set("category", opts.category)
  if (opts.q) search.set("q", opts.q)
  const qs = search.toString()
  return api.get<PublicDeck[]>(`/api/public-decks${qs ? `?${qs}` : ""}`)
}

export const importPublicDeck = (id: string) =>
  api.post<{ deckId: string }>(`/api/public-decks/${id}/import`)
