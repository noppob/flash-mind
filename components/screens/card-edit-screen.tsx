"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Sparkles, Flag, Save, BookOpen, Loader2 } from "lucide-react"
import { createCard, getCard, updateCard, toggleFlag } from "@/lib/api/cards"
import { generateAi } from "@/lib/api/ai"
import { searchDictionary } from "@/lib/api/dictionary"
import type { CardDetail } from "@/lib/api/types"
import type { DictionaryHit } from "@/lib/validation/dictionary"

export function CardEditScreen({
  deckId,
  cardId,
  initialWord,
  onBack,
}: {
  deckId: string
  cardId: string | null
  initialWord?: string
  onBack: () => void
}) {
  const isNew = cardId === null
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [card, setCard] = useState<CardDetail | null>(null)

  const [word, setWord] = useState(isNew ? (initialWord ?? "") : "")
  const [meaning, setMeaning] = useState("")
  const [example, setExample] = useState("")
  const [etymology, setEtymology] = useState("")
  const [explanation, setExplanation] = useState("")
  const [flagged, setFlagged] = useState(false)

  const [generating, setGenerating] = useState(false)

  const [suggestions, setSuggestions] = useState<DictionaryHit[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  // 直前にユーザーが候補からピックした単語。これと一致するときは候補を出さない（うるさいため）
  const [pickedWord, setPickedWord] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = word.trim()
    if (trimmed.length < 2 || trimmed === pickedWord) {
      setSuggestions([])
      setSuggestionsLoading(false)
      return
    }
    let cancelled = false
    setSuggestionsLoading(true)
    const t = setTimeout(() => {
      searchDictionary({ q: trimmed, mode: "prefix", limit: 8, distinct: true })
        .then((res) => {
          if (cancelled) return
          setSuggestions(res.hits)
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setSuggestionsLoading(false)
        })
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [word, pickedWord])

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    setLoading(true)
    getCard(deckId, cardId!)
      .then((c) => {
        if (cancelled) return
        setCard(c)
        setWord(c.word)
        setMeaning(c.meaning)
        setExample(c.example ?? "")
        setEtymology(c.etymology ?? "")
        setExplanation(c.explanation ?? "")
        setFlagged(c.flagged)
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [deckId, cardId, isNew])

  const handleGenerateAll = async () => {
    if (!word.trim()) return
    setGenerating(true)
    try {
      const result = await generateAi({ word: word.trim() })
      setMeaning(result.meaning)
      setExample(result.example)
      setEtymology(result.etymology)
      setExplanation(result.explanation)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleFlag = async () => {
    if (isNew) {
      setFlagged((prev) => !prev)
      return
    }
    try {
      const res = await toggleFlag(cardId!)
      setFlagged(res.flagged)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return
    setSaving(true)
    try {
      if (isNew) {
        await createCard(deckId, {
          word,
          meaning,
          example: example || null,
          etymology: etymology || null,
          explanation: explanation || null,
          flagged,
        })
      } else {
        await updateCard(deckId, cardId!, {
          word,
          meaning,
          example: example || null,
          etymology: etymology || null,
          explanation: explanation || null,
          flagged,
        })
      }
      onBack()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <h2 className="font-semibold text-foreground">
            {isNew ? "カード追加" : "カード編集"}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-1 text-primary font-semibold text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                {card?.category ?? "スタンダード"}
              </span>
            </div>
            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                flagged ? "bg-destructive/10" : "bg-secondary"
              }`}
            >
              <Flag
                className={`w-3.5 h-3.5 ${
                  flagged ? "text-destructive fill-destructive" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  flagged ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                苦手
              </span>
            </button>
          </div>

          <div className="mb-3 relative">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              単語
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => {
                setWord(e.target.value)
                setPickedWord(null)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSuggestions(false), 120)
              }
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowSuggestions(false)
              }}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                role="listbox"
                className="absolute top-full left-0 right-0 z-20 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.headword}-${s.pos ?? ""}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setWord(s.headword)
                      setPickedWord(s.headword)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent border-b border-border last:border-b-0"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {s.headword}
                      </span>
                      {s.pos && (
                        <span className="text-[10px] text-muted-foreground">
                          {s.pos}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.definition}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSuggestions &&
              !suggestions.length &&
              suggestionsLoading &&
              word.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-card border border-border rounded-xl shadow-sm px-3 py-2 text-xs text-muted-foreground">
                  検索中…
                </div>
              )}
          </div>

          <button
            onClick={handleGenerateAll}
            disabled={generating || !word.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl py-2.5 mb-4 font-medium text-sm disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "AI生成中..." : "AIで意味・例文・語源・解説を生成"}
          </button>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              意味
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              rows={2}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              例文
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              語源
            </label>
            <textarea
              value={etymology}
              onChange={(e) => setEtymology(e.target.value)}
              rows={3}
              placeholder="AIが語源情報を自動生成します..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              解説・メモ
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              placeholder="AIが解説を自動生成します..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            カードを保存
          </button>
        </div>
      )}
    </div>
  )
}
