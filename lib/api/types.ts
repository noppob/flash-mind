// Shared response types for the API client.
// These mirror what the route handlers in app/api/* return.

export type DeckSummary = {
  id: string
  name: string
  template: string
  color: string
  totalCards: number
  mastered: number
  dueToday: number
  createdAt: string
  updatedAt: string
}

export type DeckDetail = DeckSummary & {
  flaggedCount: number
}

export type CardListItem = {
  id: string
  word: string
  meaning: string
  example: string | null
  explanation: string | null
  flagged: boolean
  mastery: number
  nextReviewAt: string | null
}

export type CardDetail = {
  id: string
  deckId: string
  word: string
  pronunciation: string | null
  pos: string | null
  meaning: string
  category: string | null
  example: string | null
  exampleHighlight: string | null
  exampleJa: string | null
  etymology: string | null
  mnemonic: string | null
  rootImage: string | null
  explanation: string | null
  flagged: boolean
  definitions: { pos: string; items: string[] }[] | null
  phrases: { en: string; ja: string }[] | null
  relatedWords: { word: string; pos?: string }[] | null
  otherPos: { pos: string; meaning: string }[] | null
  confusables: { word: string; meaning: string; why: string }[] | null
  mastery: number
  nextReviewAt: string | null
  easeFactor: number
  memo: string
  createdAt: string
  updatedAt: string
}

export type DueCard = CardDetail

export type ReviewItem = {
  cardId: string
  mode: "flashcard" | "quiz"
  rating: number
  correct: boolean
}

export type ReviewResult = {
  totalCards: number
  correct: number
  accuracy: number
  masteryChanges: { cardId: string; word: string; from: number; to: number }[]
  weakCards: { cardId: string; word: string; mastery: number }[]
}

export type StatsOverview = {
  streak: number
  todayCards: number
  totalCardsThisWeek: number
  avgAccuracy: number
  totalCards: number
  masteredCards: number
  masteryRate: number
  totalDueToday: number
  weeklyData: { day: string; date: string; cards: number; height: number }[]
  deckStats: {
    id: string
    name: string
    color: string
    total: number
    mastered: number
    mastery: number
  }[]
}

export type WeakCard = {
  cardId: string
  word: string
  meaning: string
  ef: number
  reviews: number
  mastery: number
}

export type PublicDeck = {
  id: string
  name: string
  author: string
  totalCards: number
  downloads: number
  rating: number
  category: string
  description: string | null
}

export type Me = {
  id: string
  email: string
  displayName: string
  plan: string
  darkMode: boolean
  ttsLanguage: string
  reminderTime: string | null
  cloudSyncEnabled: boolean
}
