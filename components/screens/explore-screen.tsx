"use client"

import { useEffect, useState } from "react"
import { Search, Star, Download, BookOpen, TrendingUp, Users, Loader2 } from "lucide-react"
import { listPublicDecks, importPublicDeck } from "@/lib/api/publicDecks"
import type { PublicDeck } from "@/lib/api/types"

const CATEGORIES = ["すべて", "英語", "資格", "ビジネス", "IT", "医学", "法学"]

export function ExploreScreen({
  onDeckImported,
}: {
  onDeckImported?: (deckId: string) => void
}) {
  const [decks, setDecks] = useState<PublicDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listPublicDecks({
      category: selectedCategory === "すべて" ? undefined : selectedCategory,
      q: searchQuery || undefined,
    })
      .then((d) => !cancelled && setDecks(d))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [selectedCategory, searchQuery])

  const handleImport = async (id: string) => {
    setImportingId(id)
    try {
      const res = await importPublicDeck(id)
      onDeckImported?.(res.deckId)
    } catch (e) {
      console.error(e)
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground mb-3">探す</h1>
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

      <div className="px-5 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
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

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">人気のデッキ</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            該当するデッキがありません
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-card rounded-2xl border border-border p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm leading-tight mb-1">
                      {deck.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      <Users className="w-3 h-3 inline mr-1" />
                      {deck.author} / {deck.totalCards}枚
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
                  <button
                    onClick={() => handleImport(deck.id)}
                    disabled={importingId === deck.id}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold active:scale-[0.95] transition-transform disabled:opacity-60 flex items-center gap-1"
                  >
                    {importingId === deck.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : null}
                    追加
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
