"use client"

import { useState } from "react"
import { Search, Star, Download, BookOpen, TrendingUp, Users } from "lucide-react"

const categories = ["すべて", "英語", "資格", "ビジネス", "IT", "医学", "法学"]

const publicDecks = [
  {
    id: "1",
    name: "TOEIC 900点突破 必須単語",
    author: "StudyMaster",
    cards: 500,
    downloads: 12400,
    rating: 4.8,
    category: "英語",
  },
  {
    id: "2",
    name: "英検1級 語彙完全攻略",
    author: "EikenPro",
    cards: 1200,
    downloads: 8700,
    rating: 4.7,
    category: "英語",
  },
  {
    id: "3",
    name: "基本情報技術者 用語集",
    author: "IT_tanaka",
    cards: 350,
    downloads: 5200,
    rating: 4.6,
    category: "IT",
  },
  {
    id: "4",
    name: "マクロ経済学 基礎用語",
    author: "EconStudy",
    cards: 180,
    downloads: 3100,
    rating: 4.5,
    category: "ビジネス",
  },
  {
    id: "5",
    name: "ビジネス英語 頻出フレーズ 200",
    author: "BizEnglish",
    cards: 200,
    downloads: 9800,
    rating: 4.9,
    category: "英語",
  },
  {
    id: "6",
    name: "医学用語 基礎 400",
    author: "MedStudent22",
    cards: 400,
    downloads: 4300,
    rating: 4.4,
    category: "医学",
  },
]

export function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDecks = publicDecks.filter((deck) => {
    const matchesCategory = selectedCategory === "すべて" || deck.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground mb-3">探す</h1>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="デッキを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trending section */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">人気のデッキ</h3>
        </div>

        <div className="flex flex-col gap-3">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="bg-card rounded-2xl border border-border p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight mb-1">{deck.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    <Users className="w-3 h-3 inline mr-1" />
                    {deck.author} / {deck.cards}枚
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-foreground">{deck.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {deck.downloads > 1000
                          ? `${(deck.downloads / 1000).toFixed(1)}k`
                          : deck.downloads}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold active:scale-[0.95] transition-transform">
                  追加
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
