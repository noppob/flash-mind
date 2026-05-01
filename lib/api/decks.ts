import { api } from "./client"
import type { DeckSummary, DeckDetail, CardListItem, DueCard } from "./types"

export const listDecks = () => api.get<DeckSummary[]>("/api/decks")

export const getDeck = (deckId: string) =>
  api.get<DeckDetail>(`/api/decks/${deckId}`)

export const createDeck = (input: { name: string; template?: string; color?: string }) =>
  api.post<DeckSummary>("/api/decks", input)

export const updateDeck = (
  deckId: string,
  input: { name?: string; template?: string; color?: string },
) => api.patch<DeckSummary>(`/api/decks/${deckId}`, input)

export const deleteDeck = (deckId: string) =>
  api.delete<void>(`/api/decks/${deckId}`)

export const listCards = (
  deckId: string,
  opts: { q?: string; flagged?: boolean; limit?: number } = {},
) => {
  const search = new URLSearchParams()
  if (opts.q) search.set("q", opts.q)
  if (opts.flagged) search.set("flagged", "1")
  if (opts.limit) search.set("limit", String(opts.limit))
  const qs = search.toString()
  return api.get<CardListItem[]>(
    `/api/decks/${deckId}/cards${qs ? `?${qs}` : ""}`,
  )
}

export const getDueCards = (deckId: string, limit = 50) =>
  api.get<DueCard[]>(`/api/decks/${deckId}/due?limit=${limit}`)
