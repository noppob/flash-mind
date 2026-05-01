import { withUser, jsonError } from "@/lib/auth-helpers"
import { AiGenerateSchema, AiGenerateResultSchema } from "@/lib/validation/ai"
import { getOpenAI, AI_MODEL } from "@/lib/openai"
import { lookupForGrounding } from "@/lib/dictionary/lookup"
import { formatHitsForPrompt } from "@/lib/dictionary/format"

const SYSTEM_PROMPT = `あなたは英単語学習アプリ向けに、与えられた英単語のカード情報を生成するアシスタントです。
出力は必ず以下の 4 フィールドを持つ JSON オブジェクトで、各値は日本語の平文（Markdown・箇条書き・前置き・引用符は禁止）。

- "meaning": 最も一般的な意味を 1〜2 行で。複数品詞や意味がある場合は最も主要なものに絞り、必要なら「〜（動詞）／〜（名詞）」のようにスラッシュで併記。
- "example": その単語を自然に使った英文 1 文と、その日本語訳を半角スラッシュで区切る。例: "She emanates confidence in every meeting. / 彼女はどの会議でも自信を放っている。"
- "etymology": 接頭辞・語根・接尾辞の分解と意味、由来する言語（ラテン語・ギリシャ語など）を含めて 100〜150 字、1〜2 文で簡潔に。
- "explanation": 品詞・ニュアンス・典型的な使われ方を 100〜150 字、2〜3 文で。

JSON 以外のテキスト（コードブロック・コメント・前置き）は一切出力しないこと。`

const GROUNDING_INSTRUCTIONS = `次の「辞書ヒット (英辞郎)」が与えられたときのみ適用するルール:
- "meaning" は辞書の definition を最も主要な訳に絞り 1〜2 行に再構成。辞書にない訳語を勝手に作らない。
- 複数品詞・複数義がある場合は中心義を優先し、必要に応じ「〜（動詞）／〜（名詞）」併記。
- "example" / "etymology" / "explanation" も definition と矛盾しないこと。語源は確実な部分のみ、不明なら「語源は要確認」。
- definition に "<→other>" 参照がある場合、参照先を直接訳に採用せず "explanation" で軽く触れる程度に留める。`

export async function POST(req: Request) {
  return withUser(async () => {
    const body = await req.json().catch(() => null)
    const parsed = AiGenerateSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { word } = parsed.data

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

    const hits = await lookupForGrounding(word).catch((e) => {
      console.warn("[ai/generate] dictionary lookup failed", e)
      return []
    })
    console.log(`[ai/generate] dict hits=${hits.length} word="${word}"`)

    type ChatMessage = { role: "system" | "user"; content: string }
    const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }]
    if (hits.length > 0) {
      messages.push({ role: "system", content: GROUNDING_INSTRUCTIONS })
      messages.push({
        role: "user",
        content: `辞書ヒット (英辞郎):\n${formatHitsForPrompt(hits)}`,
      })
    }
    messages.push({ role: "user", content: `単語: ${word}` })

    let text: string
    try {
      const response = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages,
      })
      text = response.choices[0]?.message?.content?.trim() ?? ""
    } catch (e) {
      console.error("[ai/generate]", e)
      return jsonError(
        502,
        "AI_ERROR",
        e instanceof Error ? e.message : "AI request failed",
      )
    }

    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      return jsonError(502, "AI_PARSE_ERROR", "AI returned invalid JSON")
    }

    const result = AiGenerateResultSchema.safeParse(json)
    if (!result.success) {
      return jsonError(502, "AI_PARSE_ERROR", result.error.message)
    }

    return Response.json(result.data)
  })
}
