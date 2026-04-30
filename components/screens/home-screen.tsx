"use client"

import { BookOpen, Flame, ChevronRight, Sparkles, Clock, Flag } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const decks = [
  {
    id: "1",
    name: "TOEIC 頻出 800語",
    cards: 800,
    mastered: 342,
    dueToday: 24,
    color: "bg-blue-500",
    template: "スタンダード",
  },
  {
    id: "2",
    name: "英検準1級",
    cards: 520,
    mastered: 180,
    dueToday: 15,
    color: "bg-emerald-500",
    template: "英単語拡張",
  },
  {
    id: "3",
    name: "経済用語 基礎",
    cards: 200,
    mastered: 85,
    dueToday: 8,
    color: "bg-amber-500",
    template: "詳細解説付き",
  },
  {
    id: "4",
    name: "IT用語辞典",
    cards: 150,
    mastered: 50,
    dueToday: 12,
    color: "bg-rose-500",
    template: "詳細解説付き",
  },
]

export function HomeScreen({ onDeckSelect }: { onDeckSelect: (deckId: string) => void }) {
  const totalDueToday = decks.reduce((acc, d) => acc + d.dueToday, 0)
  const todayCards = 47
  const streak = 12

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
                <p className="text-3xl font-bold">{todayCards} <span className="text-base font-normal text-primary-foreground/70">cards</span></p>
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
                <p className="text-xl font-bold">8</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-xs text-primary-foreground/70">習得率</span>
                </div>
                <p className="text-xl font-bold">67%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Review Button */}
        <div className="px-5 mb-5">
          <button
            className="w-full flex items-center gap-3 bg-card rounded-2xl p-4 border border-border active:scale-[0.98] transition-transform"
            onClick={() => onDeckSelect("1")}
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

        {/* Decks */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">デッキ一覧</h2>
            <button className="text-sm text-primary font-medium">すべて見る</button>
          </div>

          <div className="flex flex-col gap-3">
            {decks.map((deck) => {
              const progress = Math.round((deck.mastered / deck.cards) * 100)
              return (
                <button
                  key={deck.id}
                  className="bg-card rounded-2xl p-4 border border-border text-left active:scale-[0.98] transition-transform"
                  onClick={() => onDeckSelect(deck.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${deck.color} flex items-center justify-center flex-shrink-0`}>
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
                        {deck.template} / {deck.cards}枚
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
        </div>
      </div>
    </div>
  )
}
