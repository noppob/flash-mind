"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Search, Flag, Eye, EyeOff, SlidersHorizontal, Loader2 } from "lucide-react"
import { listCards } from "@/lib/api/decks"
import type { CardListItem } from "@/lib/api/types"

function getMasteryColor(level: number) {
  switch (level) {
    case 1: return "bg-red-500"
    case 2: return "bg-orange-500"
    case 3: return "bg-amber-500"
    case 4: return "bg-emerald-400"
    case 5: return "bg-emerald-600"
    default: return "bg-muted"
  }
}

export function CardListScreen({
  deckId,
  onBack,
  onCardEdit,
}: {
  deckId: string
  onBack: () => void
  onCardEdit: (cardId: string | null) => void
}) {
  const [cards, setCards] = useState<CardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showMeaning, setShowMeaning] = useState(true)
  const [showExample, setShowExample] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFlagged, setFilterFlagged] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listCards(deckId, { limit: 500 })
      .then((c) => !cancelled && setCards(c))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [deckId])

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      searchQuery === "" || card.word.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFlag = !filterFlagged || card.flagged
    return matchesSearch && matchesFlag
  })

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pt-14 px-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <h2 className="font-semibold text-foreground">カード一覧</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              showFilters ? "bg-primary/10" : "bg-secondary"
            }`}
          >
            <SlidersHorizontal className={`w-4 h-4 ${showFilters ? "text-primary" : "text-foreground"}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {showFilters && (
          <div className="animate-slide-up bg-card rounded-xl border border-border p-3 mb-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">表示列の切替</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowMeaning(!showMeaning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  showMeaning ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {showMeaning ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                意味
              </button>
              <button
                onClick={() => setShowExample(!showExample)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  showExample ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {showExample ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                例文
              </button>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  showExplanation ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {showExplanation ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                解説
              </button>
              <button
                onClick={() => setFilterFlagged(!filterFlagged)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  filterFlagged ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Flag className="w-3 h-3" />
                苦手のみ
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{filteredCards.length}枚のカード</p>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onCardEdit(card.id)}
                className="bg-card rounded-xl border border-border p-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-1 h-3 rounded-full ${
                          level <= card.mastery ? getMasteryColor(card.mastery) : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-sm text-foreground">{card.word}</span>
                  {card.flagged && (
                    <Flag className="w-3 h-3 text-destructive fill-destructive flex-shrink-0" />
                  )}
                </div>
                {showMeaning && <p className="text-sm text-foreground/80 ml-4">{card.meaning}</p>}
                {showExample && card.example && (
                  <p className="text-xs text-muted-foreground italic ml-4 mt-0.5">{card.example}</p>
                )}
                {showExplanation && card.explanation && (
                  <p className="text-xs text-muted-foreground ml-4 mt-0.5">{card.explanation}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
