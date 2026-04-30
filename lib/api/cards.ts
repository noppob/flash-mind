import { api } from "./client"
import type { CardDetail } from "./types"

export const getCard = (deckId: string, cardId: string) =>
  api.get<CardDetail>(`/api/decks/${deckId}/cards/${cardId}`)

export const createCard = (
  deckId: string,
  input: Partial<CardDetail> & { word: string; meaning: string },
) => api.post<{ created: number; cards: CardDetail[] }>(`/api/decks/${deckId}/cards`, input)

export const createCards = (
  deckId: string,
  cards: (Partial<CardDetail> & { word: string; meaning: string })[],
) =>
  api.post<{ created: number; cards: CardDetail[] }>(
    `/api/decks/${deckId}/cards`,
    { cards },
  )

export const updateCard = (
  deckId: string,
  cardId: string,
  input: Partial<CardDetail>,
) => api.patch<CardDetail>(`/api/decks/${deckId}/cards/${cardId}`, input)

export const deleteCard = (deckId: string, cardId: string) =>
  api.delete<void>(`/api/decks/${deckId}/cards/${cardId}`)

export const toggleFlag = (cardId: string) =>
  api.post<{ id: string; flagged: boolean }>(`/api/cards/${cardId}/flag`)

export const getMemo = (cardId: string) =>
  api.get<{ content: string }>(`/api/cards/${cardId}/memo`)

export const saveMemo = (cardId: string, content: string) =>
  api.put<{ content: string }>(`/api/cards/${cardId}/memo`, { content })
