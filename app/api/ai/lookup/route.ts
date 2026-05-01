import { z } from "zod"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { getOpenAI, AI_MODEL } from "@/lib/openai"
import { lookupForGrounding } from "@/lib/dictionary/lookup"
import { formatHitsForPrompt } from "@/lib/dictionary/format"

const LookupSchema = z.object({
  word: z.string().min(1).max(120),
  sentence: z.string().max(1000).optional(),
})

const SYSTEM_PROMPT =
  "あなたは英文中の特定の英単語の日本語訳を返す辞書アシスタントです。与えられた単語と（あれば）文脈に基づいて、その語が文中で持つ意味を日本語 1 行（最大 30 文字）で返してください。複数候補がある場合は文脈で最適なものに絞ってください。出力は意味本文のみ。Markdown・前置き・引用符・読み仮名は禁止。"

const GROUNDING_INSTRUCTIONS =
  "次の「辞書ヒット (英辞郎)」の definition を一次情報として使い、文脈があればその中で最適な義を選んで 30 文字以内に圧縮した日本語訳 1 行を返してください。辞書にない訳を作らないこと。〔...〕などの注釈はそのまま含めず、意味の核に絞ること。"

// 辞書側で意味が一意（単一エントリ）のとき、AI を呼ばずに即返すためのショートカット。
// 30 文字を超える definition はそのまま返さず AI ground に回す（要約が必要なため）。
const DICT_DIRECT_MAX_LEN = 30

function pickShortDefinition(definition: string): string | null {
  const trimmed = definition
    .replace(/^〔[^〕]*〕/, "")
    .replace(/^《[^》]*》/, "")
    .trim()
  if (!trimmed) return null
  const firstClause = trimmed.split(/[、,]/)[0]?.trim()
  if (firstClause && firstClause.length <= DICT_DIRECT_MAX_LEN) return firstClause
  return null
}

export async function POST(req: Request) {
  return withUser(async () => {
    const body = await req.json().catch(() => null)
    const parsed = LookupSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { word, sentence } = parsed.data

    const hits = await lookupForGrounding(word).catch((e) => {
      console.warn("[ai/lookup] dictionary lookup failed", e)
      return []
    })
    console.log(
      `[ai/lookup] dict hits=${hits.length} word="${word}" sentence=${sentence ? "yes" : "no"}`,
    )

    // 文脈なし & 意味が単一 & 短ければ AI を呼ばずに直返し
    if (!sentence && hits.length === 1) {
      const direct = pickShortDefinition(hits[0].definition)
      if (direct) {
        return Response.json({ word, meaning: direct, source: "dictionary" })
      }
    }

    let client
    try {
      client = getOpenAI()
    } catch (e) {
      return jsonError(
        503,
        "AI_UNAVAILABLE",
        e instanceof Error ? e.message : "AI service is unavailable",
      )
    }

    type ChatMessage = { role: "system" | "user"; content: string }
    const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }]
    if (hits.length > 0) {
      messages.push({ role: "system", content: GROUNDING_INSTRUCTIONS })
      messages.push({
        role: "user",
        content: `辞書ヒット (英辞郎):\n${formatHitsForPrompt(hits)}`,
      })
    }
    messages.push({
      role: "user",
      content: sentence ? `単語: ${word}\n文: ${sentence}` : `単語: ${word}`,
    })

    try {
      const response = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 80,
        messages,
      })

      const meaning = response.choices[0]?.message?.content?.trim() ?? ""

      return Response.json({
        word,
        meaning,
        source: hits.length > 0 ? "ai+dictionary" : "ai",
      })
    } catch (e) {
      console.error("[ai/lookup]", e)
      return jsonError(
        502,
        "AI_ERROR",
        e instanceof Error ? e.message : "AI request failed",
      )
    }
  })
}
