"use client"

import { useEffect, useState } from "react"
import { BookOpen, Flame, ChevronRight, Sparkles, Clock, Flag, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { listDecks } from "@/lib/api/decks"
import { getStatsOverview } from "@/lib/api/stats"
import type { DeckSummary, StatsOverview } from "@/lib/api/types"

export function HomeScreen({ onDeckSelect }: { onDeckSelect: (deckId: string) => void }) {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([listDecks(), getStatsOverview()])
      .then(([d, s]) => {
        if (cancelled) return
        setDecks(d)
        setStats(s)
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const totalDueToday = stats?.totalDueToday ?? decks.reduce((acc, d) => acc + d.dueToday, 0)
  const todayCards = stats?.todayCards ?? 0
  const streak = stats?.streak ?? 0
  const masteryRate = stats?.masteryRate ?? 0
  const totalFlagged = decks.reduce(
    (acc, d) => acc + (d.totalCards - d.mastered > 0 ? 0 : 0),
    0,
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-2xl font-bold text-foreground">FlashMind</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Today's Summary Card */}
        <div className="px-5 mb-5">
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-5 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-primary-foreground/70">{"Today's Progress"}</p>
                <p className="text-3xl font-bold">
                  {todayCards}{" "}
                  <span className="text-base font-normal text-primary-foreground/70">cards</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-primary-foreground/20 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold">{streak}日連続</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-xs text-primary-foreground/70">復習待ち</span>
                </div>
                <p className="text-xl font-bold">{totalDueToday}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flag className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-xs text-primary-foreground/70">苦手</span>
                </div>
                <p className="text-xl font-bold">{totalFlagged}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-xs text-primary-foreground/70">習得率</span>
                </div>
                <p className="text-xl font-bold">{masteryRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Review Button */}
        {decks.length > 0 && (
          <div className="px-5 mb-5">
            <button
              className="w-full flex items-center gap-3 bg-card rounded-2xl p-4 border border-border active:scale-[0.98] transition-transform"
              onClick={() => onDeckSelect(decks[0].id)}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">AI おすすめ復習</p>
                <p className="text-sm text-muted-foreground">SRSに基づく最適な{totalDueToday}枚</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Decks */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">デッキ一覧</h2>
            <button className="text-sm text-primary font-medium">すべて見る</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              デッキがまだありません
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {decks.map((deck) => {
                const progress =
                  deck.totalCards > 0
                    ? Math.round((deck.mastered / deck.totalCards) * 100)
                    : 0
                return (
                  <button
                    key={deck.id}
                    className="bg-card rounded-2xl p-4 border border-border text-left active:scale-[0.98] transition-transform"
                    onClick={() => onDeckSelect(deck.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${deck.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-semibold text-foreground truncate pr-2">{deck.name}</h3>
                          {deck.dueToday > 0 && (
                            <span className="flex-shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {deck.dueToday}枚
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {deck.template} / {deck.totalCards}枚
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-muted-foreground w-9 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
