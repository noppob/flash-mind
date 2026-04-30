"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, Star, Eye, EyeOff, RotateCcw, Lightbulb, StickyNote, Undo2, SkipBack, Play, SkipForward, Repeat, BookOpen, Shuffle } from "lucide-react"

/* ─── Sample Data ─── */
const WORDS = [
  {
    id: "0001",
    word: "premium",
    pronunciation: "/\u02C8pri\u02D0mi\u0259m/",
    pos: "\u540D",
    meaning: "\u4FDD\u967A\u6599",
    category: "\u30D3\u30B8\u30CD\u30B9\u554F\u984C",
    example: "I paid over $3,000 in annual life insurance premiums.",
    exampleHighlight: "premiums",
    exampleJa: "\u79C1\u306F\u5E74\u9593\u306E\u751F\u547D\u4FDD\u967A\u306E\u4FDD\u967A\u6599\u306B3000\u30C9\u30EB\u4EE5\u4E0A\u3092\u6255\u3063\u305F",
    definitions: [
      { pos: "\u540D", items: ["\u4FDD\u967A\u6599", "\u5272\u5897\u91D1\u3001\u30D7\u30EC\u30DF\u30A2\u30E0", "\u30CF\u30A4\u30AA\u30AF\u30AC\u30BD\u30EA\u30F3"] },
      { pos: "\u5F62", items: ["\u9AD8\u7D1A\u306A", "\u30D7\u30EC\u30DF\u30A2\u306E\u3064\u3044\u305F"] },
    ],
    phrases: [
      { en: "car insurance premiums", ja: "\u81EA\u52D5\u8ECA\u4FDD\u967A\u306E\u4FDD\u967A\u6599" },
      { en: "at a premium", ja: "\u30D7\u30EC\u30DF\u30A2\u3064\u304D\u3067\u3001\u984D\u9762\u4EE5\u4E0A\u3067\uFF1B\u54C1\u4E0D\u8DB3\u3067" },
      { en: "premium quality", ja: "\u6700\u9AD8\u54C1\u8CEA\u306E" },
    ],
    etymology: "\u30E9\u30C6\u30F3\u8A9E praemium\uFF08\u5831\u916C\u3001\u621A\u5229\u54C1\uFF09\u304C\u8A9E\u6E90\u3002pre-\uFF08\u524D\u306B\uFF09+ emere\uFF08\u8CB7\u3046\uFF09\u3067\u300C\u5148\u306B\u8CB7\u3044\u53D6\u308B\u3082\u306E\u300D\u2192\u300C\u5272\u589E\u91D1\u30FB\u4FDD\u967A\u6599\u300D",
    mnemonic: "\u300C\u30D7\u30EC\u30DF\u30A2\u30E0\u300D\u306A\u30D3\u30FC\u30EB\u306F\u4FA1\u683C\u304C\u5272\u5897\u3055\u308C\u3066\u3044\u308B\u2192\u5272\u5897\u91D1\u30FB\u4FDD\u967A\u6599",
    rootImage: "\u300Cpre-\uFF08\u524D\u306B\uFF09+ emere\uFF08\u8CB7\u3046\uFF09\u300D\u2192 \u4E8B\u524D\u306B\u652F\u6255\u3046\u304A\u91D1\u3002\u300C\u5148\u6255\u3044\u300D\u304C\u6839\u672C\u30A4\u30E1\u30FC\u30B8\u3002",
    relatedWords: [{ word: "premium", pos: "\u540D/\u5F62" }, { word: "premiere", pos: "\u540D" }, { word: "preempt", pos: "\u52D5" }],
    otherPos: [{ pos: "\u5F62", meaning: "\u9AD8\u7D1A\u306A\u3001\u30D7\u30EC\u30DF\u30A2\u306E\u3064\u3044\u305F" }],
    confusables: [{ word: "premier", meaning: "\u9996\u76F8\u3001\u7B2C\u4E00\u306E", why: "\u30B9\u30DA\u30EB\u304C\u4F3C\u3066\u3044\u308B" }],
  },
  {
    id: "0002",
    word: "comprehensive",
    pronunciation: "/\u02CCk\u0252mpr\u026A\u02C8hens\u026Av/",
    pos: "\u5F62",
    meaning: "\u5305\u62EC\u7684\u306A",
    category: "\u30D3\u30B8\u30CD\u30B9\u554F\u984C",
    example: "We need a comprehensive analysis of the market.",
    exampleHighlight: "comprehensive",
    exampleJa: "\u5E02\u5834\u306E\u5305\u62EC\u7684\u306A\u5206\u6790\u304C\u5FC5\u8981\u3060",
    definitions: [{ pos: "\u5F62", items: ["\u5305\u62EC\u7684\u306A", "\u7DCF\u5408\u7684\u306A", "\u7406\u89E3\u529B\u306E\u3042\u308B"] }],
    phrases: [
      { en: "comprehensive insurance", ja: "\u7DCF\u5408\u4FDD\u967A" },
      { en: "comprehensive review", ja: "\u5305\u62EC\u7684\u306A\u30EC\u30D3\u30E5\u30FC" },
    ],
    etymology: "com-\uFF08\u5171\u306B\uFF09+ prehendere\uFF08\u3064\u304B\u3080\uFF09\u2192\u300C\u5168\u3066\u3092\u3064\u304B\u3080\u300D",
    mnemonic: "\u300C\u30B3\u30F3\u30D7\u30EA\u300D\u3092\u5168\u90E8\u300C\u30D8\u30F3\u300D\u3067\u300C\u30B7\u30D6\u300D\u3063\u3068\u3064\u304B\u3080\u2192\u5305\u62EC\u7684",
    rootImage: "\u300Ccom-\uFF08\u5168\u3066\uFF09+ prehend\uFF08\u3064\u304B\u3080\uFF09\u300D\u2192 \u5168\u3066\u3092\u3064\u304B\u307F\u53D6\u308B\u3002",
    relatedWords: [{ word: "comprehend", pos: "\u52D5" }, { word: "apprehend", pos: "\u52D5" }],
    otherPos: [],
    confusables: [{ word: "comprise", meaning: "\u69CB\u6210\u3059\u308B", why: "\u300Ccomp-\u300D\u304C\u5171\u901A" }],
  },
  {
    id: "0003",
    word: "deteriorate",
    pronunciation: "/d\u026A\u02C8t\u026A\u0259ri\u0259re\u026At/",
    pos: "\u52D5",
    meaning: "\u60AA\u5316\u3059\u308B",
    category: "\u30D3\u30B8\u30CD\u30B9\u554F\u984C",
    example: "The patient\u2019s condition began to deteriorate rapidly.",
    exampleHighlight: "deteriorate",
    exampleJa: "\u60A3\u8005\u306E\u5BB9\u614B\u306F\u6025\u901F\u306B\u60AA\u5316\u3057\u59CB\u3081\u305F",
    definitions: [{ pos: "\u52D5", items: ["\u60AA\u5316\u3059\u308B", "\u52A3\u5316\u3059\u308B", "\u8870\u9000\u3059\u308B"] }],
    phrases: [
      { en: "deteriorate rapidly", ja: "\u6025\u901F\u306B\u60AA\u5316\u3059\u308B" },
      { en: "health deteriorated", ja: "\u5065\u5EB7\u304C\u60AA\u5316\u3057\u305F" },
    ],
    etymology: "de-\uFF08\u4E0B\u306B\uFF09+ terior\uFF08\u3088\u308A\u60AA\u3044\uFF09\u2192\u300C\u3088\u308A\u60AA\u3044\u65B9\u3078\u300D",
    mnemonic: "\u300C\u30C7\u30C6\u300D\u304C\u300C\u30EA\u30AA\u300D\u306E\u300C\u30EC\u30FC\u30C8\u300D\u3092\u4E0B\u3052\u308B\u2192\u60AA\u5316",
    rootImage: "\u300Cde-\uFF08\u4E0B\u3078\uFF09+ terior\uFF08\u60AA\u3044\uFF09\u300D\u2192 \u4E0B\u306B\u60AA\u304F\u306A\u308B\u3002",
    relatedWords: [{ word: "deter", pos: "\u52D5" }, { word: "determination", pos: "\u540D" }],
    otherPos: [{ pos: "\u540D", meaning: "deterioration\uFF08\u60AA\u5316\uFF09" }],
    confusables: [{ word: "determine", meaning: "\u6C7A\u5B9A\u3059\u308B", why: "\u300Cdeter-\u300D\u304C\u5171\u901A" }],
  },
]

/* ─── Highlight helper ─── */
function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  const regex = new RegExp(`(${highlight})`, "gi")
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-destructive font-bold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

/* ─── Stop propagation helper ─── */
const stop = {
  onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
  onTouchEnd: (e: React.TouchEvent) => e.stopPropagation(),
}

export function FlashcardScreen({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [starred, setStarred] = useState<Record<string, boolean>>({})
  const [showWord, setShowWord] = useState(true)
  const [showMeaning, setShowMeaning] = useState(true)
  const [showExample, setShowExample] = useState(true)
  const [memos, setMemos] = useState<Record<string, string>>({})
  const [slideClass, setSlideClass] = useState("")

  /* Swipe state */
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const swipeThreshold = 60

  const card = WORDS[currentIndex]
  const total = WORDS.length

  /* Today's stats (mock) */
  const todayTotal = 47
  const todayNew = 12

  const flip = useCallback(() => setIsFlipped((f) => !f), [])

  const goTo = useCallback((dir: "next" | "prev") => {
    // Immediately reset to front face before animation starts
    setIsFlipped(false)
    const anim = dir === "next" ? "animate-slide-left" : "animate-slide-right"
    setSlideClass(anim)
    setTimeout(() => {
      setCurrentIndex((i) => {
        if (dir === "next") return i < WORDS.length - 1 ? i + 1 : i
        return i > 0 ? i - 1 : i
      })
      setShowWord(true)
      setShowMeaning(true)
      setShowExample(true)
      setSlideClass("")
      // Scroll back face to top
      if (backScrollRef.current) backScrollRef.current.scrollTop = 0
    }, 200)
  }, [])

  const resetCard = useCallback(() => {
    setShowWord(true)
    setShowMeaning(true)
    setShowExample(true)
    setIsFlipped(false)
  }, [])

  const toggleStar = useCallback(() => {
    setStarred((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
  }, [card.id])

  /* Ref for scrolling back face to top on card change */
  const backScrollRef = useRef<HTMLDivElement>(null)

  /* ─── Touch: swipe detected at release only, no drag follow ─── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const elapsed = Date.now() - touchStartRef.current.time
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Only trigger horizontal swipe if horizontal movement dominates vertical
    if (absDx > swipeThreshold && absDx > absDy * 1.5) {
      goTo(dx < 0 ? "next" : "prev")
    } else if (absDx < 10 && absDy < 10 && elapsed < 300) {
      flip()
    }
  }, [goTo, flip])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ─── CSS ─── */}
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
        @keyframes slide-left {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes slide-right {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(40px); opacity: 0; }
        }
        .animate-slide-left { animation: slide-left 0.2s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.2s ease-out forwards; }
      `}</style>

      {/* ═══ Header ═══ */}
      <div className="pt-14 px-4 pb-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-0.5 text-primary">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{"戻る"}</span>
          </button>
          <div className="bg-secondary px-4 py-1 rounded-full">
            <span className="text-sm font-semibold text-foreground">{"すべて"}</span>
          </div>
          <span className="text-xs text-muted-foreground">{card.category}</span>
        </div>
        {/* Today stats bar */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">{"今日の学習"}</span>
              <span className="text-sm font-bold text-foreground leading-tight">{todayTotal}<span className="text-xs font-normal text-muted-foreground ml-0.5">{"語"}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <Shuffle className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">{"新規"}</span>
              <span className="text-sm font-bold text-primary leading-tight">{todayNew}<span className="text-xs font-normal text-muted-foreground ml-0.5">{"語"}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Card Area ═══ */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div
          className={`w-full card-perspective ${slideClass}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>

            {/* ══════ FRONT ══════ */}
            <div className="card-face w-full min-h-[480px] bg-card rounded-2xl border border-border shadow-sm flex flex-col">
              {/* Top row */}
              <div className="flex items-center justify-between px-4 pt-4 pb-1">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleStar() }} {...stop} aria-label="Favorite">
                    <Star className={`w-5 h-5 ${starred[card.id] ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`} />
                  </button>
                  <span className="text-sm text-muted-foreground font-mono">{card.id}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{card.category}</span>
              </div>

              {/* Word section - fixed height */}
              <div className="relative h-[140px] flex flex-col items-center justify-center px-6 border-b border-border">
                <button onClick={(e) => { e.stopPropagation(); setShowWord(!showWord) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle word">
                  {showWord ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showWord ? (
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-3xl font-bold text-foreground">
                      <span className="underline decoration-accent decoration-[3px] underline-offset-4">{card.word}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">{card.pronunciation}</p>
                  </div>
                ) : (
                  <div className="w-32 h-8 bg-secondary rounded-lg" />
                )}
                <button onClick={(e) => { e.stopPropagation(); resetCard() }} {...stop} className="absolute bottom-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Reset">
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Meaning section - fixed height */}
              <div className="relative h-[60px] flex items-center justify-center px-6 border-b border-border">
                <button onClick={(e) => { e.stopPropagation(); setShowMeaning(!showMeaning) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle meaning">
                  {showMeaning ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showMeaning ? (
                  <p className="text-center text-lg">
                    <span className="text-destructive font-semibold">{card.pos}.</span>{" "}
                    <span className="text-foreground">{card.meaning}</span>
                  </p>
                ) : (
                  <div className="w-24 h-6 bg-secondary rounded-lg" />
                )}
              </div>

              {/* Example section - fixed height */}
              <div className="relative h-[90px] flex items-center px-6">
                <button onClick={(e) => { e.stopPropagation(); setShowExample(!showExample) }} {...stop} className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary" aria-label="Toggle example">
                  {showExample ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showExample ? (
                  <div className="pr-8">
                    <p className="text-sm leading-relaxed text-foreground">
                      <HighlightedText text={card.example} highlight={card.exampleHighlight} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{card.exampleJa}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-4 bg-secondary rounded" />
                    <div className="w-3/4 h-4 bg-secondary rounded" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <span className="text-sm text-muted-foreground">{currentIndex + 1}/{total}</span>
                <button onClick={(e) => { e.stopPropagation(); flip() }} {...stop} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-sm font-medium active:bg-secondary transition-colors">
                  <span className="text-accent font-semibold">{"詳細"}</span>
                  <Repeat className="w-3.5 h-3.5 text-accent" />
                </button>
              </div>
            </div>

            {/* ══════ BACK ══════ */}
            <div className="card-face card-back absolute inset-0 w-full min-h-[480px] bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
              <div ref={backScrollRef} className="flex-1 overflow-y-auto">
                <div className="p-4 flex flex-col gap-2.5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{"詳細情報"}</span>
                    <span className="text-xs text-muted-foreground font-mono">{card.id} {card.word}</span>
                  </div>

                  {/* Root image */}
                  <div className="bg-primary/5 rounded-xl px-3 py-2">
                    <p className="text-[11px] font-bold text-primary mb-0.5">{"意味の根本イメージ"}</p>
                    <p className="text-xs text-foreground leading-relaxed">{card.rootImage}</p>
                  </div>

                  {/* Definitions */}
                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-1">{"意味"}</h4>
                    {card.definitions.map((def, di) => (
                      <div key={di} className="mb-1">
                        <span className="text-xs text-destructive font-semibold">{"\u3014"}{def.pos}{"\u3015"}</span>
                        <span className="text-xs text-foreground ml-1">
                          {def.items.map((item, ii) => (
                            <span key={ii}>
                              {ii > 0 && " "}
                              <span className="text-muted-foreground">{"\u2460\u2461\u2462\u2463\u2464"[ii]}</span>
                              <span className={ii === 0 ? "text-destructive font-semibold" : ""}>{item}</span>
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Other parts of speech */}
                  {card.otherPos.length > 0 && (
                    <div className="border-t border-border pt-2">
                      <h4 className="text-xs font-bold text-foreground mb-1">{"他の品詞"}</h4>
                      {card.otherPos.map((op, i) => (
                        <p key={i} className="text-xs text-foreground">
                          <span className="text-destructive font-semibold">{"\u3014"}{op.pos}{"\u3015"}</span>{" "}
                          {op.meaning}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Phrases */}
                  <div className="border-t border-border pt-2">
                    <h4 className="text-xs font-bold text-foreground mb-1">{"フレーズ"}</h4>
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

                  {/* Related words (same root) */}
                  <div className="border-t border-border pt-2">
                    <h4 className="text-xs font-bold text-foreground mb-1">{"同じ語源の単語"}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {card.relatedWords.map((rw, i) => (
                        <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-lg text-foreground">
                          {rw.word} <span className="text-muted-foreground">({rw.pos})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Confusable words */}
                  {card.confusables.length > 0 && (
                    <div className="border-t border-border pt-2">
                      <h4 className="text-xs font-bold text-destructive/80 mb-1">{"間違えやすい単語"}</h4>
                      {card.confusables.map((c, i) => (
                        <div key={i} className="text-xs bg-destructive/5 rounded-lg px-2.5 py-1.5 mb-1">
                          <span className="font-semibold text-foreground">{c.word}</span>
                          <span className="text-muted-foreground ml-1">- {c.meaning}</span>
                          <span className="text-destructive/70 ml-1 text-[10px]">({c.why})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Etymology & Mnemonic */}
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <h4 className="text-xs font-bold text-foreground">{"語源・語呂合わせ"}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-1">{card.etymology}</p>
                    <div className="bg-accent/10 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-accent font-medium">{card.mnemonic}</p>
                    </div>
                  </div>

                  {/* Memo */}
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <StickyNote className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-bold text-foreground">{"メモ"}</h4>
                    </div>
                    <textarea
                      value={memos[card.id] || ""}
                      onChange={(e) => setMemos((prev) => ({ ...prev, [card.id]: e.target.value }))}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      placeholder={"自由にメモを書こう\u2026"}
                      className="w-full h-12 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Back footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
                <span className="text-sm text-muted-foreground">{currentIndex + 1}/{total}</span>
                <button onClick={(e) => { e.stopPropagation(); flip() }} {...stop} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-sm font-medium active:bg-secondary transition-colors">
                  <Undo2 className="w-3.5 h-3.5 text-accent" />
                  <span className="text-accent font-semibold">{"単語"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Controls ═══ */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => goTo("prev")} disabled={currentIndex === 0} className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30" aria-label="Previous">
            <SkipBack className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg" aria-label="Play">
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
          </button>
          <button onClick={() => goTo("next")} disabled={currentIndex === total - 1} className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30" aria-label="Next">
            <SkipForward className="w-5 h-5 text-foreground" />
          </button>
          <button className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-secondary text-xs font-semibold text-foreground active:scale-95 transition-transform" aria-label="Toggle mode">
            <Repeat className="w-4 h-4" />
            <span>{"単語/例文"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
