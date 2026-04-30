"use client"

import { ChevronLeft, Play, Brain, List, PlusCircle, MoreHorizontal, Flag, BookOpen, Edit3, Layers } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const cards = [
  { id: "1", word: "unprecedented", meaning: "前例のない", mastery: 4, flagged: true },
  { id: "2", word: "comprehensive", meaning: "包括的な", mastery: 3, flagged: false },
  { id: "3", word: "deteriorate", meaning: "悪化する", mastery: 1, flagged: true },
  { id: "4", word: "substantial", meaning: "かなりの", mastery: 5, flagged: false },
  { id: "5", word: "acquire", meaning: "取得する", mastery: 2, flagged: false },
  { id: "6", word: "implement", meaning: "実装する", mastery: 4, flagged: false },
  { id: "7", word: "ambiguous", meaning: "曖昧な", mastery: 1, flagged: true },
  { id: "8", word: "profound", meaning: "深い、深遠な", mastery: 3, flagged: false },
]

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

function getMasteryLabel(level: number) {
  switch (level) {
    case 1: return "未学習"
    case 2: return "学習中"
    case 3: return "復習中"
    case 4: return "ほぼ暗記"
    case 5: return "完全暗記"
    default: return "未学習"
  }
}

export function DeckDetailScreen({
  onBack,
  onStartFlashcard,
  onStartQuiz,
  onCardEdit,
  onCardList,
}: {
  onBack: () => void
  onStartFlashcard: () => void
  onStartQuiz: () => void
  onCardEdit: () => void
  onCardList: () => void
}) {
  const totalCards = 800
  const mastered = 342
  const progress = Math.round((mastered / totalCards) * 100)
  const dueToday = 24
  const flaggedCount = cards.filter((c) => c.flagged).length

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
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">TOEIC 頻出 800語</h1>
            <p className="text-sm text-muted-foreground">スタンダード / {totalCards}枚</p>
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
          <span className="text-xs text-muted-foreground">{mastered}/{totalCards}</span>
        </div>
      </div>

      {/* Study Buttons */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={onStartFlashcard}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Play className="w-6 h-6" />
            <span className="text-sm font-semibold">フラッシュカード</span>
          </button>
          <button
            onClick={onStartQuiz}
            className="flex-1 bg-accent text-accent-foreground rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
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
            onClick={onCardEdit}
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

        <div className="flex flex-col gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={onCardEdit}
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
      </div>
    </div>
  )
}
