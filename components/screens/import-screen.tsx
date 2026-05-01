"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import {
  Youtube,
  FileText,
  Headphones,
  ChevronLeft,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  BookPlus,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Link2,
  ChevronRight,
  Plus,
  Search,
  X,
  Check,
  Loader2,
} from "lucide-react"
import { listDecks } from "@/lib/api/decks"
import { createCards } from "@/lib/api/cards"
import { importFromUrl, importPdf } from "@/lib/api/imports"
import { lookupWord } from "@/lib/api/ai"
import type { ImportResult } from "@/lib/imports/types"
import type { DeckSummary } from "@/lib/api/types"

const sources = [
  { id: "pdf" as const, name: "PDF", icon: FileText, color: "bg-emerald-500", inputType: "file" as const },
  { id: "podcast" as const, name: "Podcast", icon: Headphones, color: "bg-purple-500", inputType: "url" as const },
  { id: "youtube" as const, name: "YouTube", icon: Youtube, color: "bg-red-500", inputType: "url" as const },
]

type SourceId = "pdf" | "podcast" | "youtube"

interface RegisteredWord {
  word: string
  sourceIndex: number
}

interface PopoverState {
  word: string
  lineIndex: number
  x: number
  y: number
}

export function ImportScreen() {
  const [selectedSource, setSelectedSource] = useState<SourceId | null>(null)
  const [url, setUrl] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [showJapanese, setShowJapanese] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeLine, setActiveLine] = useState(0)
  const [registeredWords, setRegisteredWords] = useState<RegisteredWord[]>([])
  const [meaningCache, setMeaningCache] = useState<Record<string, string>>({})
  const [lookupLoading, setLookupLoading] = useState(false)

  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [meaningPreview, setMeaningPreview] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showRegister, setShowRegister] = useState(false)
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [decksLoading, setDecksLoading] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")
  const [registering, setRegistering] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)

  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const transcript = importResult?.transcript ?? []
  const totalDuration = useMemo(() => {
    if (importResult?.durationSeconds) return importResult.durationSeconds
    if (transcript.length === 0) return 0
    const last = transcript[transcript.length - 1].time
    return last + 10
  }, [importResult, transcript])

  const showTranscript = importResult !== null
  const selected = sources.find((s) => s.id === selectedSource)

  /* ─── Close popover on outside tap ─── */
  useEffect(() => {
    if (!popover) return
    const handler = () => {
      setPopover(null)
      setMeaningPreview(null)
    }
    const t = setTimeout(() => document.addEventListener("click", handler, { once: true }), 50)
    return () => clearTimeout(t)
  }, [popover])

  /* ─── Playback simulation (PDF lines have synthetic time = index) ─── */
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 1
          if (next >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (playInterval.current) clearInterval(playInterval.current)
    }
  }, [isPlaying, totalDuration])

  useEffect(() => {
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (currentTime >= transcript[i].time) {
        setActiveLine(i)
        break
      }
    }
  }, [currentTime, transcript])

  const formatTime = (sec: number) => {
    if (importResult?.sourceType === "pdf") return `#${sec + 1}`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const resetAnalysis = () => {
    setImportResult(null)
    setRegisteredWords([])
    setMeaningCache({})
    setShowRegister(false)
    setRegisterSuccess(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setActiveLine(0)
  }

  const handleAnalyze = useCallback(async () => {
    if (!selected) return
    setError(null)
    setIsAnalyzing(true)
    try {
      let result: ImportResult
      if (selected.id === "pdf") {
        if (!pdfFile) {
          setError("PDF ファイルを選択してください")
          return
        }
        result = await importPdf(pdfFile)
      } else if (selected.id === "youtube") {
        if (!url.trim()) {
          setError("YouTube URL を入力してください")
          return
        }
        result = await importFromUrl("youtube", url.trim())
      } else {
        if (!url.trim()) {
          setError("Podcast URL を入力してください")
          return
        }
        result = await importFromUrl("podcast", url.trim())
      }
      setImportResult(result)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "取得に失敗しました")
    } finally {
      setIsAnalyzing(false)
    }
  }, [selected, pdfFile, url])

  const isRegistered = (word: string, lineIndex: number) =>
    registeredWords.some((w) => w.word === word && w.sourceIndex === lineIndex)

  const handleWordTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent, word: string, lineIndex: number) => {
      e.stopPropagation()
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const x = rect.left + rect.width / 2 - containerRect.left
      const y = rect.top - containerRect.top

      setMeaningPreview(meaningCache[word] ?? null)
      setPopover({ word, lineIndex, x, y })
    },
    [meaningCache],
  )

  const registerWord = useCallback((word: string, lineIndex: number) => {
    setRegisteredWords((prev) => {
      const exists = prev.find((w) => w.word === word && w.sourceIndex === lineIndex)
      if (exists) return prev.filter((w) => !(w.word === word && w.sourceIndex === lineIndex))
      return [...prev, { word, sourceIndex: lineIndex }]
    })
    setPopover(null)
    setMeaningPreview(null)
  }, [])

  const handleLookup = useCallback(async () => {
    if (!popover) return
    const cached = meaningCache[popover.word]
    if (cached) {
      setMeaningPreview(cached)
      return
    }
    setLookupLoading(true)
    try {
      const sentence = transcript[popover.lineIndex]?.en ?? ""
      const { meaning } = await lookupWord(popover.word, sentence)
      const value = meaning || "（取得できませんでした）"
      setMeaningCache((prev) => ({ ...prev, [popover.word]: value }))
      setMeaningPreview(value)
    } catch (e) {
      console.error(e)
      setMeaningPreview("（辞書アクセスに失敗）")
    } finally {
      setLookupLoading(false)
    }
  }, [popover, meaningCache, transcript])

  const renderWords = (text: string, lineIndex: number) => {
    const words = text.split(/(\s+)/)
    return words.map((token, i) => {
      if (/^\s+$/.test(token)) return <span key={i}>{" "}</span>
      const cleanWord = token.replace(/[.,!?;:'"()]/g, "").toLowerCase()
      if (!cleanWord) return <span key={i}>{token}</span>
      const registered = isRegistered(cleanWord, lineIndex)
      return (
        <span
          key={i}
          className={`inline-block rounded px-0.5 transition-colors select-none cursor-pointer ${
            registered ? "bg-primary/20 text-primary font-semibold" : "active:bg-accent/20"
          }`}
          onClick={(e) => handleWordTap(e, cleanWord, lineIndex)}
        >
          {token}
        </span>
      )
    })
  }

  /* ─── Open the deck picker, fetch deck list if not cached ─── */
  const openRegisterPanel = useCallback(async () => {
    if (registeredWords.length === 0) return
    setShowRegister(true)
    setRegisterSuccess(null)
    if (decks.length === 0) {
      setDecksLoading(true)
      try {
        const list = await listDecks()
        setDecks(list)
      } catch (e) {
        console.error(e)
      } finally {
        setDecksLoading(false)
      }
    }
  }, [registeredWords, decks.length])

  /* ─── Resolve any missing meanings, then bulk-create cards in the deck. ─── */
  const submitRegister = useCallback(
    async (deckId: string) => {
      setRegistering(true)
      try {
        // Fill in any missing meanings sequentially. (Cheap with Haiku 4.5.)
        const filled: Record<string, string> = { ...meaningCache }
        for (const rw of registeredWords) {
          if (filled[rw.word]) continue
          try {
            const sentence = transcript[rw.sourceIndex]?.en ?? ""
            const { meaning } = await lookupWord(rw.word, sentence)
            filled[rw.word] = meaning || ""
          } catch (e) {
            console.error(e)
            filled[rw.word] = ""
          }
        }
        setMeaningCache(filled)

        // Dedupe by word so we don't insert duplicates of the same lemma.
        const seen = new Set<string>()
        const cards = registeredWords
          .filter((rw) => {
            if (seen.has(rw.word)) return false
            seen.add(rw.word)
            return true
          })
          .map((rw) => ({
            word: rw.word,
            meaning: filled[rw.word] || "（意味未取得）",
            example: transcript[rw.sourceIndex]?.en ?? null,
          }))

        const result = await createCards(deckId, cards)
        const deck = decks.find((d) => d.id === deckId)
        setRegisterSuccess(
          `${result.created} 枚を「${deck?.name ?? "デッキ"}」に追加しました`,
        )
        setRegisteredWords([])
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : "登録に失敗しました")
      } finally {
        setRegistering(false)
      }
    },
    [registeredWords, meaningCache, transcript, decks],
  )

  /* ═══════════════ Source Selection View ═══════════════ */
  if (!showTranscript) {
    return (
      <div className="h-full flex flex-col">
        <div className="pt-16 px-5 pb-3">
          <h1 className="text-2xl font-bold text-foreground mb-1">コンテンツ取込</h1>
          <p className="text-sm text-muted-foreground">外部ソースから書き起こしを読み込み</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex flex-col gap-3 mb-5">
            {sources.map((source) => {
              const Icon = source.icon
              const isSelected = selectedSource === source.id
              return (
                <button
                  key={source.id}
                  onClick={() => {
                    setSelectedSource(source.id)
                    setError(null)
                  }}
                  className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${
                    isSelected ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-border"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${source.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{source.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {source.id === "pdf" && "書き起こしを抽出して表示"}
                      {source.id === "podcast" && "音声を書き起こして表示（近日対応）"}
                      {source.id === "youtube" && "字幕を書き起こして表示"}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground/40"}`} />
                </button>
              )
            })}
          </div>

          {selected && (
            <div className="animate-slide-up">
              <div className="bg-card rounded-2xl border border-border p-4 mb-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  {selected.name}から取込
                </h3>

                {selected.inputType === "file" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer active:bg-secondary/30"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    {pdfFile ? (
                      <p className="text-sm text-foreground font-medium">{pdfFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">ファイルをドロップ</p>
                        <p className="mt-2 text-sm text-primary font-medium">ファイルを選択</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        setPdfFile(f)
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={selected.id === "youtube" ? "YouTube URL を貼り付け" : "Podcast URL を貼り付け"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}

                {error && (
                  <p className="mt-2 text-xs text-destructive">{error}</p>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-3 flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>解析中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>書き起こしを取得</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-foreground mb-2">操作方法</h4>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <p>• 単語をタップ → 登録/辞書のミニバブルが表示</p>
                  <p>• 下部の再生ボタンで音声再生（PDF はスクロール）</p>
                  <p>• 右上の目アイコンで和訳表示切替</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ═══════════════ Transcript Viewer ═══════════════ */
  return (
    <div ref={containerRef} className="h-full flex flex-col relative">
      {/* Header */}
      <div className="pt-14 px-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={resetAnalysis} className="flex items-center gap-1 text-primary active:opacity-70">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <div className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1">
            {selected && (() => { const Icon = selected.icon; return <Icon className="w-3.5 h-3.5 text-muted-foreground" /> })()}
            <span className="text-xs font-medium text-foreground">{selected?.name}</span>
          </div>
          <button
            onClick={() => setShowJapanese(!showJapanese)}
            className="flex items-center gap-1 text-sm text-muted-foreground active:opacity-70"
          >
            {showJapanese ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-xs">和訳</span>
          </button>
        </div>
      </div>

      {/* Registered count bar */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2">
          <BookPlus className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs text-foreground">
            <span className="font-bold text-primary">{registeredWords.length}</span>
            語 選択済み
          </span>
          {registeredWords.length > 0 && (
            <button
              onClick={openRegisterPanel}
              className="ml-auto text-xs font-semibold text-primary active:opacity-70"
            >
              デッキに登録
            </button>
          )}
        </div>
        {registerSuccess && (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <Check className="w-4 h-4" />
            <span>{registerSuccess}</span>
          </div>
        )}
      </div>

      {/* Transcript lines */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-3"
        onClick={() => {
          setPopover(null)
          setMeaningPreview(null)
        }}
      >
        <div className="flex flex-col gap-1">
          {transcript.map((line, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-3.5 py-2.5 transition-colors ${
                idx === activeLine ? "bg-primary/5 border border-primary/15" : "border border-transparent"
              }`}
            >
              <span
                className={`text-[10px] font-mono cursor-pointer ${idx === activeLine ? "text-primary" : "text-muted-foreground/60"}`}
                onClick={() => {
                  setCurrentTime(line.time)
                  setActiveLine(idx)
                }}
              >
                {formatTime(line.time)}
              </span>

              <p className="text-sm leading-relaxed text-foreground mt-0.5">{renderWords(line.en, idx)}</p>

              {showJapanese && line.ja && (
                <p className="text-xs leading-relaxed text-muted-foreground mt-1">{line.ja}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Inline Popover ─── */}
      {popover && (
        <div
          className="absolute z-50"
          style={{
            left: `${Math.max(80, Math.min(popover.x, (containerRef.current?.clientWidth ?? 300) - 80))}px`,
            top: `${popover.y - 8}px`,
            transform: "translate(-50%, -100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {meaningPreview && (
            <div className="mb-1.5 bg-card border border-border rounded-xl px-3 py-2 shadow-lg min-w-[160px] max-w-[260px] text-center animate-slide-up">
              <p className="text-xs font-bold text-foreground">{popover.word}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{meaningPreview}</p>
            </div>
          )}

          <div className="flex items-center gap-1 bg-foreground rounded-full px-1.5 py-1 shadow-xl">
            <button
              onClick={() => registerWord(popover.word, popover.lineIndex)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isRegistered(popover.word, popover.lineIndex)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/20 text-background hover:bg-background/30"
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{isRegistered(popover.word, popover.lineIndex) ? "登録済" : "登録"}</span>
            </button>

            <div className="w-px h-5 bg-background/20" />

            <button
              onClick={handleLookup}
              disabled={lookupLoading}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-background/20 text-background hover:bg-background/30 transition-colors disabled:opacity-50"
            >
              {lookupLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
              <span>辞書</span>
            </button>
          </div>

          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 bg-foreground rotate-45 -mt-1.5" />
          </div>
        </div>
      )}

      {/* ─── Playback controls ─── */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 pt-3 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-muted-foreground font-mono w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono w-10">{formatTime(Math.max(totalDuration - 1, 0))}</span>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center active:bg-muted transition-colors"
            aria-label="10 seconds back"
          >
            <SkipBack className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => {
              setCurrentTime(0)
              setIsPlaying(false)
            }}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center active:bg-muted transition-colors"
            aria-label="Stop"
          >
            <Square className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center active:opacity-80 transition-opacity shadow-md"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setCurrentTime((t) => Math.min(totalDuration, t + 10))}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center active:bg-muted transition-colors"
            aria-label="10 seconds forward"
          >
            <SkipForward className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* ─── Deck picker bottom sheet ─── */}
      {showRegister && (
        <div
          className="absolute inset-0 z-40 bg-black/40 flex items-end"
          onClick={() => !registering && setShowRegister(false)}
        >
          <div
            className="w-full bg-background rounded-t-3xl border-t border-border max-h-[70%] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-semibold text-foreground">登録先デッキを選択</h3>
              <button
                onClick={() => setShowRegister(false)}
                disabled={registering}
                className="p-1 -mr-1 active:opacity-70 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="px-5 pb-2 text-xs text-muted-foreground">
              {registeredWords.length} 語をまとめてカード化します
            </p>
            <div className="flex-1 overflow-y-auto px-3 pb-2">
              {decksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : decks.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  デッキがありません。新規デッキ機能は近日対応予定。
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => submitRegister(deck.id)}
                      disabled={registering}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl bg-card border border-border active:bg-secondary/40 disabled:opacity-50 text-left"
                    >
                      <div className={`w-3 h-3 rounded-full ${deck.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{deck.name}</p>
                        <p className="text-xs text-muted-foreground">{deck.totalCards} 枚</p>
                      </div>
                      {registering ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
