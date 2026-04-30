"use client"

import { useState } from "react"
import { ChevronLeft, Search, Flag, Eye, EyeOff, SlidersHorizontal } from "lucide-react"

const allCards = [
  { id: "1", word: "unprecedented", meaning: "前例のない", example: "an unprecedented crisis", explanation: "前例が全くないこと", mastery: 4, flagged: true },
  { id: "2", word: "comprehensive", meaning: "包括的な", example: "a comprehensive study", explanation: "全てを含む", mastery: 3, flagged: false },
  { id: "3", word: "deteriorate", meaning: "悪化する", example: "conditions deteriorated", explanation: "状態が悪くなる", mastery: 1, flagged: true },
  { id: "4", word: "substantial", meaning: "かなりの", example: "a substantial increase", explanation: "量が多い", mastery: 5, flagged: false },
  { id: "5", word: "acquire", meaning: "取得する", example: "acquire skills", explanation: "手に入れる", mastery: 2, flagged: false },
  { id: "6", word: "implement", meaning: "実装する", example: "implement a plan", explanation: "実行する", mastery: 4, flagged: false },
  { id: "7", word: "ambiguous", meaning: "曖昧な", example: "an ambiguous answer", explanation: "はっきりしない", mastery: 1, flagged: true },
  { id: "8", word: "profound", meaning: "深い", example: "a profound impact", explanation: "非常に深い", mastery: 3, flagged: false },
  { id: "9", word: "eloquent", meaning: "雄弁な", example: "an eloquent speech", explanation: "話がうまい", mastery: 2, flagged: false },
  { id: "10", word: "pragmatic", meaning: "実用的な", example: "a pragmatic approach", explanation: "現実的な", mastery: 3, flagged: false },
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

export function CardListScreen({ onBack }: { onBack: () => void }) {
  const [showMeaning, setShowMeaning] = useState(true)
  const [showExample, setShowExample] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFlagged, setFilterFlagged] = useState(false)

  const filteredCards = allCards.filter((card) => {
    const matchesSearch = searchQuery === "" || card.word.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Column toggles */}
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
        <div className="flex flex-col gap-2">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-card rounded-xl border border-border p-3"
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
                {card.flagged && <Flag className="w-3 h-3 text-destructive fill-destructive flex-shrink-0" />}
              </div>
              {showMeaning && (
                <p className="text-sm text-foreground/80 ml-4">{card.meaning}</p>
              )}
              {showExample && (
                <p className="text-xs text-muted-foreground italic ml-4 mt-0.5">{card.example}</p>
              )}
              {showExplanation && (
                <p className="text-xs text-muted-foreground ml-4 mt-0.5">{card.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
