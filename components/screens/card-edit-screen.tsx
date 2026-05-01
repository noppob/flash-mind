"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Sparkles, Flag, Save, Wand2, BookOpen, Loader2 } from "lucide-react"
import { createCard, getCard, updateCard, toggleFlag } from "@/lib/api/cards"
import { generateAi } from "@/lib/api/ai"
import type { CardDetail } from "@/lib/api/types"

export function CardEditScreen({
  deckId,
  cardId,
  onBack,
}: {
  deckId: string
  cardId: string | null
  onBack: () => void
}) {
  const isNew = cardId === null
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [card, setCard] = useState<CardDetail | null>(null)

  const [word, setWord] = useState("")
  const [meaning, setMeaning] = useState("")
  const [example, setExample] = useState("")
  const [etymology, setEtymology] = useState("")
  const [explanation, setExplanation] = useState("")
  const [flagged, setFlagged] = useState(false)

  const [generatingMeaning, setGeneratingMeaning] = useState(false)
  const [generatingEtymology, setGeneratingEtymology] = useState(false)
  const [generatingExplanation, setGeneratingExplanation] = useState(false)

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

  const handleGenerateMeaning = async () => {
    if (!word.trim()) return
    setGeneratingMeaning(true)
    try {
      const { result } = await generateAi({ kind: "meaning", word: word.trim() })
      if (result) setMeaning(result)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingMeaning(false)
    }
  }

  const handleGenerateEtymology = async () => {
    if (!word.trim()) return
    setGeneratingEtymology(true)
    try {
      const { result } = await generateAi({ kind: "etymology", word: word.trim() })
      if (result) setEtymology(result)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingEtymology(false)
    }
  }

  const handleGenerateExplanation = async () => {
    if (!word.trim()) return
    setGeneratingExplanation(true)
    try {
      const { result } = await generateAi({
        kind: "explanation",
        word: word.trim(),
        meaning: meaning.trim() || undefined,
      })
      if (result) setExplanation(result)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingExplanation(false)
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

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              単語
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                意味
              </label>
              <button
                onClick={handleGenerateMeaning}
                disabled={generatingMeaning}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${generatingMeaning ? "animate-pulse-soft" : ""}`}
                />
                {generatingMeaning ? "生成中..." : "AI生成"}
              </button>
            </div>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                語源
              </label>
              <button
                onClick={handleGenerateEtymology}
                disabled={generatingEtymology}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Wand2
                  className={`w-3.5 h-3.5 ${generatingEtymology ? "animate-pulse-soft" : ""}`}
                />
                {generatingEtymology ? "生成中..." : "AI語源生成"}
              </button>
            </div>
            <textarea
              value={etymology}
              onChange={(e) => setEtymology(e.target.value)}
              rows={3}
              placeholder="AIが語源情報を自動生成します..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                解説・メモ
              </label>
              <button
                onClick={handleGenerateExplanation}
                disabled={generatingExplanation}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${generatingExplanation ? "animate-pulse-soft" : ""}`}
                />
                {generatingExplanation ? "生成中..." : "AI解説生成"}
              </button>
            </div>
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
