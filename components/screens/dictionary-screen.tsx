"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  Search,
  X,
  BookOpen,
  Loader2,
  Plus,
  History,
  Sparkles,
} from "lucide-react"
import { searchDictionary } from "@/lib/api/dictionary"
import { listDecks } from "@/lib/api/decks"
import type {
  DictionaryHit,
  DictionarySearchMode,
  DictionarySearchDirection,
} from "@/lib/validation/dictionary"
import type { DeckSummary } from "@/lib/api/types"

const RECENT_KEY = "flashmind:dict:recent"
const RECENT_MAX = 10

const MODES: { id: DictionarySearchMode; label: string }[] = [
  { id: "exact", label: "完全" },
  { id: "prefix", label: "前方" },
  { id: "partial", label: "部分" },
]

function readRecent(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string").slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined") return
  const trimmed = q.trim()
  if (!trimmed) return
  const list = readRecent().filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
  list.unshift(trimmed)
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)))
  } catch {
    /* ignore */
  }
}

function clearRecent() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(RECENT_KEY)
  } catch {
    /* ignore */
  }
}

export function DictionaryScreen({
  onBack,
  onCreateCard,
}: {
  onBack: () => void
  onCreateCard: (deckId: string, word: string) => void
}) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<DictionarySearchMode>("prefix")
  const [direction, setDirection] = useState<DictionarySearchDirection>("en2ja")
  const [hits, setHits] = useState<DictionaryHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [pickerWord, setPickerWord] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<{
    headword: string
    list: DictionaryHit[]
    loading: boolean
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleExpand = (headword: string, fallbackList: DictionaryHit[]) => {
    setExpandedGroup({ headword, list: fallbackList, loading: true })
    searchDictionary({
      q: headword,
      mode: "exact",
      direction: "en2ja",
      limit: 50,
      distinct: false,
    })
      .then((res) => {
        setExpandedGroup((prev) =>
          prev && prev.headword === headword
            ? { headword, list: res.hits.length > 0 ? res.hits : fallbackList, loading: false }
            : prev,
        )
      })
      .catch((e: unknown) => {
        console.error(e)
        setExpandedGroup((prev) =>
          prev && prev.headword === headword
            ? { headword, list: fallbackList, loading: false }
            : prev,
        )
      })
  }

  useEffect(() => {
    setRecent(readRecent())
    listDecks()
      .then(setDecks)
      .catch((e) => console.error(e))
    inputRef.current?.focus()
  }, [])

  // 入力変更でデバウンス検索。空入力なら結果リセット。
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setHits([])
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      searchDictionary({
        q: trimmed,
        mode,
        direction,
        limit: direction === "ja2en" ? 30 : mode === "exact" ? 30 : 50,
        distinct: direction === "ja2en" ? true : mode !== "exact",
      })
        .then((res) => {
          if (cancelled) return
          setHits(res.hits)
        })
        .catch((e: unknown) => {
          if (cancelled) return
          setHits([])
          setError(e instanceof Error ? e.message : "検索に失敗しました")
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, mode, direction])

  const onSubmit = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    pushRecent(trimmed)
    setRecent(readRecent())
  }

  const onPickRecent = (s: string) => {
    setQuery(s)
    inputRef.current?.focus()
  }

  const handleAddToCardClicked = (word: string) => {
    if (decks.length === 0) {
      setError("デッキが見つかりません。先にデッキを作成してください。")
      return
    }
    if (decks.length === 1) {
      pushRecent(word)
      onCreateCard(decks[0].id, word)
      return
    }
    setPickerWord(word)
  }

  const handlePickDeck = (deckId: string) => {
    if (!pickerWord) return
    pushRecent(pickerWord)
    const word = pickerWord
    setPickerWord(null)
    onCreateCard(deckId, word)
  }

  const showRecent = !query.trim() && recent.length > 0
  const showEmpty = !!query.trim() && !loading && hits.length === 0 && !error

  const shouldGroup = direction === "ja2en" || mode !== "exact"
  const groupedByHeadword = useMemo(() => {
    if (!shouldGroup) return null
    const map = new Map<string, DictionaryHit[]>()
    for (const h of hits) {
      const list = map.get(h.headword) ?? []
      list.push(h)
      map.set(h.headword, list)
    }
    return Array.from(map.entries())
  }, [hits, shouldGroup])

  return (
    <div className="relative h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-0.5 text-primary"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </button>
          <h2 className="font-semibold text-foreground flex-1 text-center -ml-12">
            英辞郎で検索
          </h2>
        </div>
      </div>

      {/* Search input + direction + mode tabs */}
      <div className="px-4 pb-3">
        {/* Direction toggle */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setDirection("en2ja")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
              direction === "en2ja"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            英→日
          </button>
          <button
            onClick={() => setDirection("ja2en")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
              direction === "ja2en"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            日→英
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              direction === "en2ja"
                ? "単語を入力（例: emanate）"
                : "日本語で入力（例: 放つ）"
            }
            className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="クリア"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* mode tabs (英→日のときのみ表示。日→英は常に部分一致) */}
        {direction === "en2ja" && (
          <div className="mt-2 flex gap-1">
            {MODES.map((m) => {
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">検索中…</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-xs rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}

        {showRecent && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" />
                最近の検索
              </span>
              <button
                onClick={() => {
                  clearRecent()
                  setRecent([])
                }}
                className="hover:text-foreground"
              >
                クリア
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((s) => (
                <button
                  key={s}
                  onClick={() => onPickRecent(s)}
                  className="bg-secondary text-foreground rounded-full px-3 py-1 text-xs hover:bg-secondary/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!query.trim() && recent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Sparkles className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">単語を入力すると英辞郎を検索します</p>
            <p className="text-xs mt-1 opacity-70">
              {"完全 / 前方 / 部分 一致を切り替え可能"}
            </p>
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-sm">ヒットなし</p>
            {direction === "en2ja" && (
              <p className="text-xs mt-1 opacity-70">
                モードを「{mode === "exact" ? "前方" : "部分"}」に切り替えてみてください
              </p>
            )}
            {direction === "ja2en" && (
              <p className="text-xs mt-1 opacity-70">
                短いキーワード（例:「捨てる」「光を」）に変えてみてください
              </p>
            )}
          </div>
        )}

        {/* 完全一致 (英→日): 全エントリ展開 */}
        {!shouldGroup && hits.length > 0 && (
          <div className="space-y-2">
            {hits.map((h, i) => (
              <DictionaryEntryCard
                key={`${h.headword}-${h.pos ?? ""}-${i}`}
                hit={h}
                onAdd={() => handleAddToCardClicked(h.headword)}
                onAliasClick={(alias) => handleExpand(alias, [])}
              />
            ))}
          </div>
        )}

        {/* 前方/部分/逆引き: 見出しごとにグルーピング */}
        {shouldGroup && groupedByHeadword && groupedByHeadword.length > 0 && (
          <div className="space-y-2">
            {groupedByHeadword.map(([headword, list]) => (
              <DictionaryGroupedCard
                key={headword}
                headword={headword}
                list={list}
                onAdd={() => handleAddToCardClicked(headword)}
                onExpand={() => handleExpand(headword, list)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded entry overlay (全エントリ表示) */}
      {expandedGroup && (
        <div
          className="absolute inset-0 z-30 bg-black/40 flex items-end"
          onClick={() => setExpandedGroup(null)}
        >
          <div
            className="w-full bg-card rounded-t-2xl p-4 pb-8 max-h-[85%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground text-base">
                {expandedGroup.headword}
              </h3>
              <button onClick={() => setExpandedGroup(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              {expandedGroup.loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  読み込み中…
                </>
              ) : (
                <>{expandedGroup.list.length} 件のエントリ</>
              )}
            </p>
            <div className="space-y-2">
              {expandedGroup.list.map((h, i) => (
                <DictionaryEntryCard
                  key={`${h.pos ?? ""}-${i}`}
                  hit={h}
                  onAdd={() => {
                    setExpandedGroup(null)
                    handleAddToCardClicked(h.headword)
                  }}
                  onAliasClick={(alias) => handleExpand(alias, [])}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deck picker overlay */}
      {pickerWord && (
        <div
          className="absolute inset-0 z-30 bg-black/40 flex items-end"
          onClick={() => setPickerWord(null)}
        >
          <div
            className="w-full bg-card rounded-t-2xl p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">
                「{pickerWord}」をカード化
              </h3>
              <button onClick={() => setPickerWord(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              追加先のデッキを選択
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {decks.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handlePickDeck(d.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80"
                >
                  <span className="text-sm font-medium text-foreground">
                    {d.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {d.totalCards} 枚
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// definition 内の "→<英単語>" パターンを検出してクリック可能なリンクに変換する。
// 英辞郎の本文には aliasOf に抽出されない参照表記 (例: "〈英〉→test a missile-defense system",
// "<→target>") が混ざるため、ここでまとめてリンク化する。
function renderDefinition(
  text: string,
  onAliasClick?: (alias: string) => void,
): ReactNode {
  if (!onAliasClick) return text
  const re = /→([a-zA-Z][a-zA-Z0-9'\- ]*[a-zA-Z0-9])/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const target = match[1]
    parts.push("→")
    parts.push(
      <button
        key={match.index}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAliasClick(target.trim())
        }}
        className="text-primary hover:underline"
      >
        {target}
      </button>,
    )
    lastIndex = re.lastIndex
  }
  if (parts.length === 0) return text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return <>{parts}</>
}

function DictionaryEntryCard({
  hit,
  onAdd,
  onAliasClick,
}: {
  hit: DictionaryHit
  onAdd: () => void
  onAliasClick?: (alias: string) => void
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-base font-semibold text-foreground truncate">
            {hit.headword}
          </span>
          {hit.pos && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {hit.pos}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 shrink-0"
        >
          <Plus className="w-3 h-3" />
          カード化
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        {renderDefinition(hit.definition, onAliasClick)}
      </p>
      {hit.note && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {hit.note}
        </p>
      )}
      {hit.aliasOf &&
        (onAliasClick ? (
          <button
            type="button"
            onClick={() => onAliasClick(hit.aliasOf!)}
            className="text-[11px] text-primary mt-1 hover:underline"
          >
            → 参照: {hit.aliasOf}
          </button>
        ) : (
          <p className="text-[11px] text-muted-foreground mt-1">
            → 参照: {hit.aliasOf}
          </p>
        ))}
    </div>
  )
}

function DictionaryGroupedCard({
  headword,
  list,
  onAdd,
  onExpand,
}: {
  headword: string
  list: DictionaryHit[]
  onAdd: () => void
  onExpand: () => void
}) {
  const main = list[0]
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onExpand()
        }
      }}
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-base font-semibold text-foreground truncate">
          {headword}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 shrink-0"
        >
          <Plus className="w-3 h-3" />
          カード化
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed line-clamp-2">
        {main.pos && (
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded mr-1.5">
            {main.pos}
          </span>
        )}
        {main.definition}
      </p>
      <p className="text-[11px] text-primary mt-1.5">
        タップで全ての意味を表示
      </p>
    </div>
  )
}
