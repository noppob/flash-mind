"use client"

import { useState, useRef, useCallback, useEffect } from "react"
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
  BookOpen,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Link2,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react"

/* ─── Source types ─── */
const sources = [
  { id: "pdf" as const, name: "PDF", icon: FileText, color: "bg-emerald-500", inputType: "file" as const },
  { id: "podcast" as const, name: "Podcast", icon: Headphones, color: "bg-purple-500", inputType: "url" as const },
  { id: "youtube" as const, name: "YouTube", icon: Youtube, color: "bg-red-500", inputType: "url" as const },
]

type SourceId = "pdf" | "podcast" | "youtube"

/* ─── Mock transcript data ─── */
const transcript = [
  {
    time: 0,
    en: "Today we're going to talk about sustainable investing and its impact on the global economy.",
    ja: "\u4ECA\u65E5\u306F\u30B5\u30B9\u30C6\u30CA\u30D6\u30EB\u6295\u8CC7\u3068\u305D\u306E\u4E16\u754C\u7D4C\u6E08\u3078\u306E\u5F71\u97FF\u306B\u3064\u3044\u3066\u304A\u8A71\u3057\u3057\u307E\u3059\u3002",
  },
  {
    time: 12,
    en: "The infrastructure required for renewable energy has become a key investment area.",
    ja: "\u518D\u751F\u53EF\u80FD\u30A8\u30CD\u30EB\u30AE\u30FC\u306B\u5FC5\u8981\u306A\u30A4\u30F3\u30D5\u30E9\u306F\u3001\u91CD\u8981\u306A\u6295\u8CC7\u5206\u91CE\u3068\u306A\u3063\u3066\u3044\u307E\u3059\u3002",
  },
  {
    time: 23,
    en: "Market volatility has increased significantly due to geopolitical tensions.",
    ja: "\u5730\u653F\u5B66\u7684\u7DCA\u5F35\u306B\u3088\u308A\u3001\u5E02\u5834\u306E\u5909\u52D5\u6027\u304C\u5927\u5E45\u306B\u9AD8\u307E\u3063\u3066\u3044\u307E\u3059\u3002",
  },
  {
    time: 35,
    en: "Companies leverage artificial intelligence to mitigate risks in their portfolio management.",
    ja: "\u4F01\u696D\u306F\u30DD\u30FC\u30C8\u30D5\u30A9\u30EA\u30AA\u7BA1\u7406\u306E\u30EA\u30B9\u30AF\u3092\u7DE9\u548C\u3059\u308B\u305F\u3081\u306BAI\u3092\u6D3B\u7528\u3057\u3066\u3044\u307E\u3059\u3002",
  },
  {
    time: 48,
    en: "The resilience of emerging markets has surprised many analysts this quarter.",
    ja: "\u65B0\u8208\u5E02\u5834\u306E\u56DE\u5FA9\u529B\u306F\u3001\u4ECA\u56DB\u534A\u671F\u591A\u304F\u306E\u30A2\u30CA\u30EA\u30B9\u30C8\u3092\u9A5A\u304B\u305B\u307E\u3057\u305F\u3002",
  },
  {
    time: 60,
    en: "A paradigm shift in monetary policy has created new opportunities for institutional investors.",
    ja: "\u91D1\u878D\u653F\u7B56\u306E\u30D1\u30E9\u30C0\u30A4\u30E0\u30B7\u30D5\u30C8\u304C\u3001\u6A5F\u95A2\u6295\u8CC7\u5BB6\u306B\u65B0\u305F\u306A\u6A5F\u4F1A\u3092\u751F\u307F\u51FA\u3057\u3066\u3044\u307E\u3059\u3002",
  },
  {
    time: 74,
    en: "Building consensus among stakeholders remains a significant challenge in corporate governance.",
    ja: "\u30B9\u30C6\u30FC\u30AF\u30DB\u30EB\u30C0\u30FC\u9593\u306E\u5408\u610F\u5F62\u6210\u306F\u3001\u30B3\u30FC\u30DD\u30EC\u30FC\u30C8\u30AC\u30D0\u30CA\u30F3\u30B9\u306B\u304A\u3051\u308B\u91CD\u8981\u306A\u8AB2\u984C\u3067\u3059\u3002",
  },
  {
    time: 88,
    en: "Premium bonds have outperformed traditional equities in this fiscal year.",
    ja: "\u30D7\u30EC\u30DF\u30A2\u30E0\u50B5\u5238\u306F\u3001\u4ECA\u4F1A\u8A08\u5E74\u5EA6\u5F93\u6765\u306E\u682A\u5F0F\u3092\u4E0A\u56DE\u308B\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9\u3092\u898B\u305B\u3066\u3044\u307E\u3059\u3002",
  },
]

/* ─── Registered words state ─── */
interface RegisteredWord {
  word: string
  sourceIndex: number
}

/* ─── Popover state ─── */
interface PopoverState {
  word: string
  lineIndex: number
  x: number
  y: number
}

/* ─── Mock meaning lookup ─── */
const mockMeanings: Record<string, string> = {
  sustainable: "\u6301\u7D9A\u53EF\u80FD\u306A",
  investing: "\u6295\u8CC7",
  impact: "\u5F71\u97FF\u3001\u30A4\u30F3\u30D1\u30AF\u30C8",
  global: "\u4E16\u754C\u7684\u306A",
  economy: "\u7D4C\u6E08",
  infrastructure: "\u30A4\u30F3\u30D5\u30E9\u3001\u57FA\u76E4",
  renewable: "\u518D\u751F\u53EF\u80FD\u306A",
  energy: "\u30A8\u30CD\u30EB\u30AE\u30FC",
  investment: "\u6295\u8CC7",
  volatility: "\u5909\u52D5\u6027\u3001\u30DC\u30E9\u30C6\u30A3\u30EA\u30C6\u30A3",
  geopolitical: "\u5730\u653F\u5B66\u7684\u306A",
  leverage: "\u6D3B\u7528\u3059\u308B\u3001\u3066\u3053",
  artificial: "\u4EBA\u5DE5\u306E",
  intelligence: "\u77E5\u80FD\u3001\u60C5\u5831",
  mitigate: "\u7DE9\u548C\u3059\u308B",
  portfolio: "\u30DD\u30FC\u30C8\u30D5\u30A9\u30EA\u30AA",
  resilience: "\u56DE\u5FA9\u529B\u3001\u5F3E\u529B\u6027",
  emerging: "\u65B0\u8208\u306E",
  analysts: "\u30A2\u30CA\u30EA\u30B9\u30C8",
  paradigm: "\u30D1\u30E9\u30C0\u30A4\u30E0\u3001\u6A21\u7BC4",
  monetary: "\u91D1\u878D\u306E\u3001\u901A\u8CA8\u306E",
  institutional: "\u6A5F\u95A2\u306E",
  consensus: "\u5408\u610F\u3001\u30B3\u30F3\u30BB\u30F3\u30B5\u30B9",
  stakeholders: "\u30B9\u30C6\u30FC\u30AF\u30DB\u30EB\u30C0\u30FC\u3001\u5229\u5BB3\u95A2\u4FC2\u8005",
  governance: "\u30AC\u30D0\u30CA\u30F3\u30B9\u3001\u7D71\u6CBB",
  premium: "\u30D7\u30EC\u30DF\u30A2\u30E0\u3001\u4FDD\u967A\u6599",
  equities: "\u682A\u5F0F",
  fiscal: "\u4F1A\u8A08\u306E\u3001\u8CA1\u653F\u306E",
  outperformed: "\u4E0A\u56DE\u3063\u305F",
}

export function ImportScreen() {
  /* ─── Screen state: source selection -> transcript viewer ─── */
  const [selectedSource, setSelectedSource] = useState<SourceId | null>(null)
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  /* ─── Transcript state ─── */
  const [showJapanese, setShowJapanese] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeLine, setActiveLine] = useState(0)
  const [registeredWords, setRegisteredWords] = useState<RegisteredWord[]>([])

  /* ─── Inline popover ─── */
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [meaningPreview, setMeaningPreview] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const totalDuration = 100

  const selected = sources.find((s) => s.id === selectedSource)

  /* ─── Close popover on outside tap ─── */
  useEffect(() => {
    if (!popover) return
    const handler = () => { setPopover(null); setMeaningPreview(null) }
    const t = setTimeout(() => document.addEventListener("click", handler, { once: true }), 50)
    return () => clearTimeout(t)
  }, [popover])

  /* ─── Playback simulation ─── */
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 1
          if (next >= totalDuration) { setIsPlaying(false); return totalDuration }
          return next
        })
      }, 1000)
    }
    return () => { if (playInterval.current) clearInterval(playInterval.current) }
  }, [isPlaying])

  /* ─── Update active line based on time ─── */
  useEffect(() => {
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (currentTime >= transcript[i].time) { setActiveLine(i); break }
    }
  }, [currentTime])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true)
    setTimeout(() => { setIsAnalyzing(false); setShowTranscript(true) }, 1500)
  }, [])

  const isRegistered = (word: string, lineIndex: number) =>
    registeredWords.some((w) => w.word === word && w.sourceIndex === lineIndex)

  /* ─── Handle word tap: show inline popover ─── */
  const handleWordTap = useCallback((e: React.MouseEvent | React.TouchEvent, word: string, lineIndex: number) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const x = rect.left + rect.width / 2 - containerRect.left
    const y = rect.top - containerRect.top

    setMeaningPreview(null)
    setPopover({ word, lineIndex, x, y })
  }, [])

  /* ─── Register word ─── */
  const registerWord = useCallback((word: string, lineIndex: number) => {
    setRegisteredWords((prev) => {
      const exists = prev.find((w) => w.word === word && w.sourceIndex === lineIndex)
      if (exists) return prev.filter((w) => !(w.word === word && w.sourceIndex === lineIndex))
      return [...prev, { word, sourceIndex: lineIndex }]
    })
    setPopover(null)
    setMeaningPreview(null)
  }, [])

  /* ─── Render individual word as tappable span ─── */
  const renderWords = (text: string, lineIndex: number) => {
    const words = text.split(/(\s+)/)
    return words.map((token, i) => {
      if (/^\s+$/.test(token)) return <span key={i}>{" "}</span>
      const cleanWord = token.replace(/[.,!?;:'"()]/g, "").toLowerCase()
      const registered = isRegistered(cleanWord, lineIndex)
      return (
        <span
          key={i}
          className={`inline-block rounded px-0.5 transition-colors select-none cursor-pointer ${
            registered
              ? "bg-primary/20 text-primary font-semibold"
              : "active:bg-accent/20"
          }`}
          onClick={(e) => handleWordTap(e, cleanWord, lineIndex)}
        >
          {token}
        </span>
      )
    })
  }

  /* ═══════════════ Source Selection View ═══════════════ */
  if (!showTranscript) {
    return (
      <div className="h-full flex flex-col">
        <div className="pt-16 px-5 pb-3">
          <h1 className="text-2xl font-bold text-foreground mb-1">{"\u30B3\u30F3\u30C6\u30F3\u30C4\u53D6\u8FBC"}</h1>
          <p className="text-sm text-muted-foreground">{"\u5916\u90E8\u30BD\u30FC\u30B9\u304B\u3089\u66F8\u304D\u8D77\u3053\u3057\u3092\u8AAD\u307F\u8FBC\u307F"}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex flex-col gap-3 mb-5">
            {sources.map((source) => {
              const Icon = source.icon
              const isSelected = selectedSource === source.id
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
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
                      {source.id === "pdf" && "\u66F8\u304D\u8D77\u3053\u3057\u3092\u62BD\u51FA\u3057\u3066\u8868\u793A"}
                      {source.id === "podcast" && "\u97F3\u58F0\u3092\u66F8\u304D\u8D77\u3053\u3057\u3066\u8868\u793A"}
                      {source.id === "youtube" && "\u5B57\u5E55\u3092\u66F8\u304D\u8D77\u3053\u3057\u3066\u8868\u793A"}
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
                  {selected.name}{"\u304B\u3089\u53D6\u8FBC"}
                </h3>

                {selected.inputType === "file" ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{"\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30ED\u30C3\u30D7"}</p>
                    <button className="mt-2 text-sm text-primary font-medium">{"\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E"}</button>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={selected.id === "youtube" ? "YouTube URL\u3092\u8CBC\u308A\u4ED8\u3051" : "Podcast URL\u3092\u8CBC\u308A\u4ED8\u3051"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-3 flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>{"\u89E3\u6790\u4E2D..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{"\u66F8\u304D\u8D77\u3053\u3057\u3092\u53D6\u5F97"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-foreground mb-2">{"\u64CD\u4F5C\u65B9\u6CD5"}</h4>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <p>{"\u2022 \u5358\u8A9E\u3092\u30BF\u30C3\u30D7 \u2192 \u767B\u9332/\u8F9E\u66F8\u306E\u30DF\u30CB\u30D0\u30D6\u30EB\u304C\u8868\u793A"}</p>
                  <p>{"\u2022 \u4E0B\u90E8\u306E\u518D\u751F\u30DC\u30BF\u30F3\u3067\u97F3\u58F0\u518D\u751F"}</p>
                  <p>{"\u2022 \u53F3\u4E0A\u306E\u76EE\u30A2\u30A4\u30B3\u30F3\u3067\u548C\u8A33\u8868\u793A\u5207\u66FF"}</p>
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
          <button onClick={() => setShowTranscript(false)} className="flex items-center gap-1 text-primary active:opacity-70">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{"\u623B\u308B"}</span>
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
            <span className="text-xs">{"\u548C\u8A33"}</span>
          </button>
        </div>
      </div>

      {/* Registered count bar */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2">
          <BookPlus className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs text-foreground">
            <span className="font-bold text-primary">{registeredWords.length}</span>{"\u8A9E \u9078\u629E\u6E08\u307F"}
          </span>
          {registeredWords.length > 0 && (
            <button className="ml-auto text-xs font-semibold text-primary active:opacity-70">{"\u30C7\u30C3\u30AD\u306B\u767B\u9332"}</button>
          )}
        </div>
      </div>

      {/* Transcript lines */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-3"
        onClick={() => { setPopover(null); setMeaningPreview(null) }}
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
                onClick={() => { setCurrentTime(line.time); setActiveLine(idx) }}
              >
                {formatTime(line.time)}
              </span>

              <p className="text-sm leading-relaxed text-foreground mt-0.5">
                {renderWords(line.en, idx)}
              </p>

              {showJapanese && (
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
          {/* Meaning preview (shown when search pressed) */}
          {meaningPreview && (
            <div className="mb-1.5 bg-card border border-border rounded-xl px-3 py-2 shadow-lg min-w-[160px] text-center animate-slide-up">
              <p className="text-xs font-bold text-foreground">{popover.word}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{meaningPreview}</p>
            </div>
          )}

          {/* Action bubble */}
          <div className="flex items-center gap-1 bg-foreground rounded-full px-1.5 py-1 shadow-xl">
            {/* Register button */}
            <button
              onClick={() => registerWord(popover.word, popover.lineIndex)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isRegistered(popover.word, popover.lineIndex)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/20 text-background hover:bg-background/30"
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{isRegistered(popover.word, popover.lineIndex) ? "\u767B\u9332\u6E08" : "\u767B\u9332"}</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-background/20" />

            {/* Meaning lookup button */}
            <button
              onClick={() => {
                const m = mockMeanings[popover.word]
                setMeaningPreview(m || "\u8F9E\u66F8\u306B\u898B\u3064\u304B\u308A\u307E\u305B\u3093")
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-background/20 text-background hover:bg-background/30 transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>{"\u8F9E\u66F8"}</span>
            </button>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 bg-foreground rotate-45 -mt-1.5" />
          </div>
        </div>
      )}

      {/* ─── Playback controls ─── */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 pt-3 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono w-8">{formatTime(totalDuration)}</span>
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
            onClick={() => { setCurrentTime(0); setIsPlaying(false) }}
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
    </div>
  )
}
