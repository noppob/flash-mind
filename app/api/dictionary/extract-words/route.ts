import { withUser, jsonError } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  extractEnglishTokens,
  sortedByCount,
} from "@/lib/dictionary/extract"
import {
  ExtractWordsBodySchema,
  type ExtractWordsResponse,
  type ExtractedWord,
} from "@/lib/validation/dictionary"

export async function POST(req: Request) {
  return withUser(async ({ userId }) => {
    const body = await req.json().catch(() => null)
    const parsed = ExtractWordsBodySchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { text, deckId, limit } = parsed.data

    const counts = extractEnglishTokens(text)
    const totalUniqueTokens = counts.size

    if (totalUniqueTokens === 0) {
      const empty: ExtractWordsResponse = {
        unknownWords: [],
        totalUniqueTokens: 0,
        totalRegisteredCards: 0,
      }
      return Response.json(empty)
    }

    const ranked = sortedByCount(counts)
    const lemmas = ranked.map((r) => r.word)

    // ユーザーの既存カード（全デッキ or 指定デッキ）を取得し、word を lowercase 集合化
    const userCards = await prisma.card.findMany({
      where: {
        deck: { userId },
        ...(deckId ? { deckId } : {}),
      },
      select: { word: true },
    })
    const knownSet = new Set(
      userCards.map((c) => c.word.trim().toLowerCase()),
    )

    // 辞書ヒットをまとめて取得（lemmas は数百〜数千語の見込み）
    const dictEntries = await prisma.dictionaryEntry.findMany({
      where: { headwordLower: { in: lemmas } },
      distinct: ["headwordLower"],
      select: {
        headwordLower: true,
        headword: true,
        pos: true,
        definition: true,
      },
    })
    const dictMap = new Map(dictEntries.map((e) => [e.headwordLower, e]))

    const unknownWords: ExtractedWord[] = []
    for (const { word, count } of ranked) {
      if (knownSet.has(word)) continue
      const entry = dictMap.get(word)
      if (!entry) continue
      unknownWords.push({
        word: entry.headword,
        count,
        pos: entry.pos,
        definition: entry.definition,
      })
      if (unknownWords.length >= limit) break
    }

    const result: ExtractWordsResponse = {
      unknownWords,
      totalUniqueTokens,
      totalRegisteredCards: knownSet.size,
    }
    return Response.json(result)
  })
}
