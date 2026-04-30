"use client"

import { Flame, TrendingUp, Flag, BookOpen } from "lucide-react"

const weeklyData = [
  { day: "月", cards: 32, height: 40 },
  { day: "火", cards: 45, height: 56 },
  { day: "水", cards: 28, height: 35 },
  { day: "木", cards: 52, height: 65 },
  { day: "金", cards: 38, height: 48 },
  { day: "土", cards: 65, height: 81 },
  { day: "日", cards: 47, height: 59 },
]

const weakCards = [
  { word: "deteriorate", meaning: "悪化する", ef: 1.5, reviews: 8 },
  { word: "ambiguous", meaning: "曖昧な", ef: 1.6, reviews: 6 },
  { word: "eloquent", meaning: "雄弁な", ef: 1.7, reviews: 5 },
  { word: "pragmatic", meaning: "実用的な", ef: 1.8, reviews: 5 },
  { word: "rhetoric", meaning: "修辞学", ef: 1.9, reviews: 4 },
]

const deckStats = [
  { name: "TOEIC 800語", mastery: 43, total: 800, color: "bg-blue-500" },
  { name: "英検準1級", mastery: 35, total: 520, color: "bg-emerald-500" },
  { name: "経済用語", mastery: 43, total: 200, color: "bg-amber-500" },
  { name: "IT用語", mastery: 33, total: 150, color: "bg-rose-500" },
]

export function StatsScreen() {
  const streak = 12
  const totalCards = 307
  const avgAccuracy = 78

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground">統計</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">連続日数</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalCards}</p>
            <p className="text-[10px] text-muted-foreground">今週の学習</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{avgAccuracy}%</p>
            <p className="text-[10px] text-muted-foreground">平均正答率</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <h3 className="font-semibold text-foreground mb-4">今週の学習量</h3>
          <div className="flex items-end justify-between gap-2 h-28">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{d.cards}</span>
                <div
                  className={`w-full rounded-lg transition-all ${
                    i === weeklyData.length - 1 ? "bg-primary" : "bg-primary/20"
                  }`}
                  style={{ height: `${d.height}%` }}
                />
                <span className={`text-xs font-medium ${
                  i === weeklyData.length - 1 ? "text-primary" : "text-muted-foreground"
                }`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deck Progress */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <h3 className="font-semibold text-foreground mb-3">デッキ別習得率</h3>
          <div className="flex flex-col gap-3">
            {deckStats.map((deck) => (
              <div key={deck.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground font-medium">{deck.name}</span>
                  <span className="text-xs text-muted-foreground">{deck.mastery}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${deck.color}`} style={{ width: `${deck.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak cards */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            苦手カード TOP 5
          </h3>
          <div className="flex flex-col gap-2">
            {weakCards.map((card, index) => (
              <div key={card.word} className="flex items-center gap-3 py-1.5">
                <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{card.word}</p>
                  <p className="text-xs text-muted-foreground">{card.meaning}</p>
                </div>
                <span className="text-xs text-muted-foreground">{card.reviews}回復習</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
