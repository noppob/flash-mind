"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  ChevronLeft,
  Star,
  Eye,
  EyeOff,
  RotateCcw,
  Lightbulb,
  StickyNote,
  Undo2,
  Repeat,
  BookOpen,
  Loader2,
  X,
  Check,
} from "lucide-react"
import { getDueCards } from "@/lib/api/decks"
import { submitReviews } from "@/lib/api/reviews"
import { toggleFlag, saveMemo } from "@/lib/api/cards"
import type { CardDetail, ReviewItem, ReviewResult } from "@/lib/api/types"

function HighlightedText({ text, highlight }: { text: string; highlight: string | null }) {
  if (!highlight) return <span>{text}</span>
  const regex = new RegExp(`(${highlight})`, "gi")
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-destructive font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

const stop = {
  onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
  onTouchEnd: (e: React.TouchEvent) => e.stopPropagation(),
}

export function FlashcardScreen({
  deckId,
  onClose,
  onComplete,
}: {
  deckId: string
  onClose: () => void
  onComplete: (result: ReviewResult) => void
}) {
  const [cards, setCards] = useState<CardDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showWord, setShowWord] = useState(true)
  const [showMeaning, setShowMeaning] = useState(true)
  const [showExample, setShowExample] = useState(true)
  const [memos, setMemos] = useState<Record<string, string>>({})
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const backScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDueCards(deckId, 50)
      .then((c) => {
        if (cancelled) return
        setCards(c)
        const initialMemos: Record<string, string> = {}
        for (const card of c) {
          if (card.memo) initialMemos[card.id] = card.memo
        }
        setMemos(initialMemos)
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [deckId])

  const card = cards[currentIndex]
  const total = cards.length

  const flip = useCallback(() => setIsFlipped((f) => !f), [])

  const resetCard = useCallback(() => {
    setShowWord(true)
    setShowMeaning(true)
    setShowExample(true)
    setIsFlipped(false)
  }, [])

  const handleStar = useCallback(async () => {
    if (!card) return
    try {
      await toggleFlag(card.id)
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flagged: !c.flagged } : c)),
      )
    } catch (e) {
      console.error(e)
    }
  }, [card])

  const finishSession = useCallback(
    async (items: ReviewItem[]) => {
      setSubmitting(true)
      try {
        const result = await submitReviews(items)
        // Save any local memos.
        await Promise.all(
          Object.entries(memos).map(([cardId, content]) =>
            content ? saveMemo(cardId, content).catch(() => null) : null,
          ),
        )
        onComplete(result)
      } catch (e) {
        console.error(e)
        setSubmitting(false)
      }
    },
    [memos, onComplete],
  )

  const recordAndAdvance = useCallback(
    (correct: boolean) => {
      if (!card) return
      const item: ReviewItem = {
        cardId: card.id,
        mode: "flashcard",
        rating: correct ? 5 : 2,
        correct,
      }
      const next = [...reviewItems, item]
      setReviewItems(next)
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1)
        resetCard()
        if (backScrollRef.current) backScrollRef.current.scrollTop = 0
      } else {
        finishSession(next)
      }
    },
    [card, reviewItems, currentIndex, cards.length, resetCard, finishSession],
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="pt-14 px-4 pb-3">
          <button onClick={onClose} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          今日の復習対象はありません
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <style jsx>{`
        .card-perspective { perspective: 1000px; }
        .card-inner {
          position: relative;
          transition: transform 0.5s cubic-bezier(.4,.2,.2,1);
          transform-style: preserve-3d;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      {/* Header */}
      <div className="pt-14 px-4 pb-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <div className="bg-secondary px-4 py-1 rounded-full">
            <span className="text-sm font-semibold text-foreground">学習中</span>
          </div>
          <span className="text-xs text-muted-foreground">{card.category ?? ""}</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">復習対象</span>
              <span className="text-sm font-bold text-foreground leading-tight">
                {total}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">枚</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">完了</span>
              <span className="text-sm font-bold text-primary leading-tight">
                {reviewItems.length}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">枚</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full card-perspective" onClick={flip}>
          <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>
            {/* FRONT */}
            <div className="card-face w-full min-h-[420px] bg-card rounded-2xl border border-border shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4 pb-1">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleStar() }} {...stop} aria-label="Favorite">
                    <Star className={`w-5 h-5 ${card.flagged ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`} />
                  </button>
                  <span className="text-sm text-muted-foreground font-mono">{card.id.slice(-6)}</span>
                </div>
                {card.category && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {card.category}
                  </span>
                )}
              </div>

              <div className="relative h-[140px] flex flex-col items-center justify-center px-6 border-b border-border">
                <button onClick={(e) => { e.stopPropagation(); setShowWord(!showWord) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle word">
                  {showWord ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showWord ? (
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-3xl font-bold text-foreground">
                      <span className="underline decoration-accent decoration-[3px] underline-offset-4">{card.word}</span>
                    </h2>
                    {card.pronunciation && (
                      <p className="text-sm text-muted-foreground">{card.pronunciation}</p>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-8 bg-secondary rounded-lg" />
                )}
                <button onClick={(e) => { e.stopPropagation(); resetCard() }} {...stop} className="absolute bottom-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Reset">
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="relative h-[60px] flex items-center justify-center px-6 border-b border-border">
                <button onClick={(e) => { e.stopPropagation(); setShowMeaning(!showMeaning) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle meaning">
                  {showMeaning ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showMeaning ? (
                  <p className="text-center text-lg">
                    {card.pos && <span className="text-destructive font-semibold">{card.pos}.</span>}{" "}
                    <span className="text-foreground">{card.meaning}</span>
                  </p>
                ) : (
                  <div className="w-24 h-6 bg-secondary rounded-lg" />
                )}
              </div>

              <div className="relative h-[90px] flex items-center px-6">
                <button onClick={(e) => { e.stopPropagation(); setShowExample(!showExample) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle example">
                  {showExample ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showExample && card.example ? (
                  <div className="pr-8">
                    <p className="text-sm leading-relaxed text-foreground">
                      <HighlightedText text={card.example} highlight={card.exampleHighlight} />
                    </p>
                    {card.exampleJa && (
                      <p className="text-xs text-muted-foreground mt-1">{card.exampleJa}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-4 bg-secondary rounded" />
                    <div className="w-3/4 h-4 bg-secondary rounded" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <span className="text-sm text-muted-foreground">{currentIndex + 1}/{total}</span>
                <button onClick={(e) => { e.stopPropagation(); flip() }} {...stop} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-sm font-medium active:bg-secondary transition-colors">
                  <span className="text-accent font-semibold">詳細</span>
                  <Repeat className="w-3.5 h-3.5 text-accent" />
                </button>
              </div>
            </div>

            {/* BACK */}
            <div className="card-face card-back absolute inset-0 w-full min-h-[420px] bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
              <div ref={backScrollRef} className="flex-1 overflow-y-auto">
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">詳細情報</span>
                    <span className="text-xs text-muted-foreground font-mono">{card.word}</span>
                  </div>

                  {card.rootImage && (
                    <div className="bg-primary/5 rounded-xl px-3 py-2">
                      <p className="text-[11px] font-bold text-primary mb-0.5">意味の根本イメージ</p>
                      <p className="text-xs text-foreground leading-relaxed">{card.rootImage}</p>
                    </div>
                  )}

                  {card.definitions && card.definitions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-1">意味</h4>
                      {card.definitions.map((def, di) => (
                        <div key={di} className="mb-1">
                          <span className="text-xs text-destructive font-semibold">〔{def.pos}〕</span>
                          <span className="text-xs text-foreground ml-1">{def.items.join(" / ")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {card.phrases && card.phrases.length > 0 && (
                    <div className="border-t border-border pt-2">
                      <h4 className="text-xs font-bold text-foreground mb-1">フレーズ</h4>
                      <div className="flex flex-col gap-1">
                        {card.phrases.map((phrase, pi) => (
                          <div key={pi} className="text-xs">
                            <span className="text-muted-foreground mr-1">{pi + 1}.</span>
                            <HighlightedText text={phrase.en} highlight={card.word} />
                            <span className="text-muted-foreground ml-1">{phrase.ja}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.relatedWords && card.relatedWords.length > 0 && (
                    <div className="border-t border-border pt-2">
                      <h4 className="text-xs font-bold text-foreground mb-1">同じ語源の単語</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {card.relatedWords.map((rw, i) => (
                          <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-lg text-foreground">
                            {rw.word} {rw.pos && <span className="text-muted-foreground">({rw.pos})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.confusables && card.confusables.length > 0 && (
                    <div className="border-t border-border pt-2">
                      <h4 className="text-xs font-bold text-destructive/80 mb-1">間違えやすい単語</h4>
                      {card.confusables.map((c, i) => (
                        <div key={i} className="text-xs bg-destructive/5 rounded-lg px-2.5 py-1.5 mb-1">
                          <span className="font-semibold text-foreground">{c.word}</span>
                          <span className="text-muted-foreground ml-1">- {c.meaning}</span>
                          <span className="text-destructive/70 ml-1 text-[10px]">({c.why})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(card.etymology || card.mnemonic) && (
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <h4 className="text-xs font-bold text-foreground">語源・語呂合わせ</h4>
                      </div>
                      {card.etymology && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1">{card.etymology}</p>
                      )}
                      {card.mnemonic && (
                        <div className="bg-accent/10 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-accent font-medium">{card.mnemonic}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <StickyNote className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-bold text-foreground">メモ</h4>
                    </div>
                    <textarea
                      value={memos[card.id] ?? ""}
                      onChange={(e) =>
                        setMemos((prev) => ({ ...prev, [card.id]: e.target.value }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      placeholder="自由にメモを書こう…"
                      className="w-full h-12 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
                <span className="text-sm text-muted-foreground">{currentIndex + 1}/{total}</span>
                <button onClick={(e) => { e.stopPropagation(); flip() }} {...stop} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-sm font-medium active:bg-secondary transition-colors">
                  <Undo2 className="w-3.5 h-3.5 text-accent" />
                  <span className="text-accent font-semibold">単語</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rating buttons */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => recordAndAdvance(false)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl py-3 font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            忘れた
          </button>
          <button
            onClick={() => recordAndAdvance(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            思い出せた
          </button>
        </div>
      </div>
    </div>
  )
}
