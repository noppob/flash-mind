"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  Play,
  Brain,
  List,
  PlusCircle,
  MoreHorizontal,
  Flag,
  BookOpen,
  Edit3,
  Layers,
  Loader2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getDeck, listCards } from "@/lib/api/decks"
import type { CardListItem, DeckDetail } from "@/lib/api/types"

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

export function DeckDetailScreen({
  deckId,
  onBack,
  onStartFlashcard,
  onStartQuiz,
  onCardEdit,
  onCardList,
}: {
  deckId: string
  onBack: () => void
  onStartFlashcard: () => void
  onStartQuiz: () => void
  onCardEdit: (cardId: string | null) => void
  onCardList: () => void
}) {
  const [deck, setDeck] = useState<DeckDetail | null>(null)
  const [cards, setCards] = useState<CardListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getDeck(deckId), listCards(deckId, { limit: 8 })])
      .then(([d, c]) => {
        if (cancelled) return
        setDeck(d)
        setCards(c)
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [deckId])

  const totalCards = deck?.totalCards ?? 0
  const mastered = deck?.mastered ?? 0
  const progress = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0
  const dueToday = deck?.dueToday ?? 0
  const flaggedCount = deck?.flaggedCount ?? 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl ${deck?.color ?? "bg-blue-500"} flex items-center justify-center`}>
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{deck?.name ?? "..."}</h1>
            <p className="text-sm text-muted-foreground">
              {deck?.template ?? ""} / {totalCards}枚
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-bold text-foreground">{dueToday}</p>
            <p className="text-[11px] text-muted-foreground">復習待ち</p>
          </div>
          <div className="flex-1 bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-bold text-foreground">{flaggedCount}</p>
            <p className="text-[11px] text-muted-foreground">苦手</p>
          </div>
          <div className="flex-1 bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-bold text-foreground">{progress}%</p>
            <p className="text-[11px] text-muted-foreground">習得率</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground">
            {mastered}/{totalCards}
          </span>
        </div>
      </div>

      {/* Study Buttons */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={onStartFlashcard}
            disabled={dueToday === 0}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <Play className="w-6 h-6" />
            <span className="text-sm font-semibold">フラッシュカード</span>
          </button>
          <button
            onClick={onStartQuiz}
            disabled={dueToday === 0}
            className="flex-1 bg-accent text-accent-foreground rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-semibold">4択クイズ</span>
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          <button
            onClick={onCardList}
            className="flex-1 flex items-center justify-center gap-1.5 bg-card border border-border rounded-xl py-2.5 active:scale-[0.97] transition-transform"
          >
            <List className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">一覧表示</span>
          </button>
          <button
            onClick={() => onCardEdit(null)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-card border border-border rounded-xl py-2.5 active:scale-[0.97] transition-transform"
          >
            <PlusCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">カード追加</span>
          </button>
        </div>
      </div>

      {/* Card list preview */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">カード一覧</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5" />
            <span>{cards.length}枚表示</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            カードがまだありません
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => onCardEdit(card.id)}
                className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{card.word}</p>
                    {card.flagged && <Flag className="w-3 h-3 text-destructive flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{card.meaning}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-1.5 h-4 rounded-full ${
                          level <= card.mastery ? getMasteryColor(card.mastery) : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
