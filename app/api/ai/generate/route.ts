import { withUser, jsonError } from "@/lib/auth-helpers"
import { AiGenerateSchema, type AiGenerateKindT } from "@/lib/validation/ai"
import { getOpenAI, AI_MODEL } from "@/lib/openai"

const SYSTEM_PROMPTS: Record<AiGenerateKindT, string> = {
  meaning:
    "あなたは英単語の日本語訳を端的に提示するアシスタントです。与えられた英単語について、最も一般的な意味を日本語 1〜2 行でまとめて返してください。出力は意味本文のみ。Markdown・前置き・引用符は禁止。複数の品詞や意味がある場合は最も主要なものに絞り、必要であれば「〜（動詞）／〜（名詞）」のようにスラッシュで併記してください。",
  etymology:
    "あなたは英単語の語源を解説する辞書アシスタントです。与えられた英単語について、接頭辞・語根・接尾辞の分解と意味、由来する言語（ラテン語・ギリシャ語など）を含めて、日本語の平文 100〜150 字でまとめてください。Markdown・箇条書きは使わず、1〜2 文で簡潔に。出力は本文のみ。前置きや引用符は禁止。",
  explanation:
    "あなたは英単語の使い方を解説するアシスタントです。与えられた英単語と意味を踏まえ、その単語の品詞・ニュアンス・典型的な使われ方を日本語の平文 100〜150 字でまとめてください。Markdown・箇条書きは使わず、2〜3 文で。出力は本文のみ。前置きや引用符は禁止。",
}

function buildUserMessage(
  kind: AiGenerateKindT,
  word: string,
  meaning?: string,
): string {
  if (kind === "explanation") {
    return `単語: ${word}\n意味: ${meaning?.trim() || "(未指定)"}`
  }
  return `単語: ${word}`
}

export async function POST(req: Request) {
  return withUser(async () => {
    const body = await req.json().catch(() => null)
    const parsed = AiGenerateSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { kind, word, meaning } = parsed.data

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

    try {
      const response = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[kind] },
          { role: "user", content: buildUserMessage(kind, word, meaning) },
        ],
      })

      const text = response.choices[0]?.message?.content?.trim() ?? ""

      return Response.json({ result: text })
    } catch (e) {
      console.error("[ai/generate]", e)
      return jsonError(
        502,
        "AI_ERROR",
        e instanceof Error ? e.message : "AI request failed",
      )
    }
  })
}
