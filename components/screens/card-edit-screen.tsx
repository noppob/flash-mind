"use client"

import { useState } from "react"
import { ChevronLeft, Sparkles, Flag, Save, Wand2, BookOpen } from "lucide-react"

export function CardEditScreen({ onBack }: { onBack: () => void }) {
  const [word, setWord] = useState("unprecedented")
  const [meaning, setMeaning] = useState("前例のない、空前の")
  const [example, setExample] = useState("an unprecedented economic crisis")
  const [etymology, setEtymology] = useState("")
  const [memo, setMemo] = useState("")
  const [flagged, setFlagged] = useState(false)
  const [generatingMeaning, setGeneratingMeaning] = useState(false)
  const [generatingEtymology, setGeneratingEtymology] = useState(false)
  const [generatingExplanation, setGeneratingExplanation] = useState(false)

  const handleGenerateMeaning = () => {
    setGeneratingMeaning(true)
    setTimeout(() => {
      setMeaning("前例のない、空前の、かつてない")
      setGeneratingMeaning(false)
    }, 1500)
  }

  const handleGenerateEtymology = () => {
    setGeneratingEtymology(true)
    setTimeout(() => {
      setEtymology("un-(否定) + pre-(前の) + cedent(行く) = 前例のない。ラテン語 praecedere に由来")
      setGeneratingEtymology(false)
    }, 1500)
  }

  const handleGenerateExplanation = () => {
    setGeneratingExplanation(true)
    setTimeout(() => {
      setMemo("形容詞。これまでに一度も起こったことがない、前例がない状態を表す。ニュースや学術文書で頻出。類義語: unparalleled, unheard-of")
      setGeneratingExplanation(false)
    }, 1500)
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
          <h2 className="font-semibold text-foreground">カード編集</h2>
          <button className="flex items-center gap-1 text-primary font-semibold text-sm">
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Template badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">英単語拡張</span>
          </div>
          <button
            onClick={() => setFlagged(!flagged)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
              flagged ? "bg-destructive/10" : "bg-secondary"
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${flagged ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${flagged ? "text-destructive" : "text-muted-foreground"}`}>
              苦手
            </span>
          </button>
        </div>

        {/* Word field */}
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

        {/* Meaning field with AI */}
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
              <Sparkles className={`w-3.5 h-3.5 ${generatingMeaning ? "animate-pulse-soft" : ""}`} />
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

        {/* Example field */}
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

        {/* Etymology field with AI */}
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
              <Wand2 className={`w-3.5 h-3.5 ${generatingEtymology ? "animate-pulse-soft" : ""}`} />
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

        {/* Memo/Explanation field with AI */}
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
              <Sparkles className={`w-3.5 h-3.5 ${generatingExplanation ? "animate-pulse-soft" : ""}`} />
              {generatingExplanation ? "生成中..." : "AI解説生成"}
            </button>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="AIが解説を自動生成します..."
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Save button */}
        <button className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform mb-4">
          カードを保存
        </button>
      </div>
    </div>
  )
}
