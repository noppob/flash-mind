"use client"

import { useEffect, useState } from "react"
import { Flame, TrendingUp, Flag, BookOpen, Loader2 } from "lucide-react"
import { getStatsOverview, getWeakCards } from "@/lib/api/stats"
import type { StatsOverview, WeakCard } from "@/lib/api/types"

export function StatsScreen() {
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [weakCards, setWeakCards] = useState<WeakCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getStatsOverview(), getWeakCards(5)])
      .then(([s, w]) => {
        if (cancelled) return
        setOverview(s)
        setWeakCards(w)
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !overview) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const weeklyData = overview.weeklyData
  const deckStats = overview.deckStats

  return (
    <div className="h-full flex flex-col">
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground">統計</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{overview.streak}</p>
            <p className="text-[10px] text-muted-foreground">連続日数</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{overview.totalCardsThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">今週の学習</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{overview.avgAccuracy}%</p>
            <p className="text-[10px] text-muted-foreground">平均正答率</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <h3 className="font-semibold text-foreground mb-4">今週の学習量</h3>
          <div className="flex items-end justify-between gap-2 h-28">
            {weeklyData.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{d.cards}</span>
                <div
                  className={`w-full rounded-lg transition-all ${
                    i === weeklyData.length - 1 ? "bg-primary" : "bg-primary/20"
                  }`}
                  style={{ height: `${Math.max(d.height, 4)}%` }}
                />
                <span
                  className={`text-xs font-medium ${
                    i === weeklyData.length - 1 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <h3 className="font-semibold text-foreground mb-3">デッキ別習得率</h3>
          {deckStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">デッキがまだありません</p>
          ) : (
            <div className="flex flex-col gap-3">
              {deckStats.map((deck) => (
                <div key={deck.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground font-medium">{deck.name}</span>
                    <span className="text-xs text-muted-foreground">{deck.mastery}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${deck.color}`}
                      style={{ width: `${deck.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            苦手カード TOP 5
          </h3>
          {weakCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">苦手カードはありません</p>
          ) : (
            <div className="flex flex-col gap-2">
              {weakCards.map((card, index) => (
                <div key={card.cardId} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{card.word}</p>
                    <p className="text-xs text-muted-foreground">{card.meaning}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{card.reviews}回復習</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
