"use client"

import { Trophy, Target, Brain, Flag, RotateCcw, Home } from "lucide-react"
import type { ReviewResult } from "@/lib/api/types"

export function ResultsScreen({
  result,
  onRetry,
  onHome,
}: {
  result: ReviewResult | null
  onRetry: () => void
  onHome: () => void
}) {
  const totalCards = result?.totalCards ?? 0
  const correct = result?.correct ?? 0
  const accuracy = result?.accuracy ?? 0
  const masteryChanges = result?.masteryChanges ?? []
  const weakCards = result?.weakCards ?? []

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">学習完了!</h1>
        <p className="text-sm text-muted-foreground">お疲れさまでした</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Target className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-[11px] text-muted-foreground">正答率</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Brain className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalCards}</p>
            <p className="text-[11px] text-muted-foreground">学習枚数</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Flag className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{weakCards.length}</p>
            <p className="text-[11px] text-muted-foreground">苦手カード</p>
          </div>
        </div>

        {masteryChanges.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-3">習熟度の変化</h3>
            <div className="flex flex-col gap-3">
              {masteryChanges.map((item) => (
                <div key={item.cardId} className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">{item.word}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={`from-${level}`}
                          className={`w-1.5 h-3 rounded-full ${
                            level <= item.from ? "bg-muted-foreground/30" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{">"}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={`to-${level}`}
                          className={`w-1.5 h-3 rounded-full ${
                            level <= item.to
                              ? item.to >= 4
                                ? "bg-emerald-500"
                                : item.to >= 3
                                ? "bg-amber-500"
                                : "bg-red-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakCards.length > 0 && (
          <div className="bg-destructive/5 rounded-2xl border border-destructive/20 p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4 text-destructive" />
              苦手カード
            </h3>
            {weakCards.map((card) => (
              <div key={card.cardId} className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-foreground">{card.word}</span>
                <span className="text-sm text-muted-foreground">習熟度 {card.mastery}/5</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            もう一度
          </button>
          <button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 bg-card border border-border text-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform"
          >
            <Home className="w-5 h-5" />
            ホームへ
          </button>
        </div>
      </div>
    </div>
  )
}
