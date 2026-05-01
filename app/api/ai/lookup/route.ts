import { z } from "zod"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { getAnthropic, AI_MODEL } from "@/lib/anthropic"

const LookupSchema = z.object({
  word: z.string().min(1).max(120),
  sentence: z.string().max(1000).optional(),
})

const SYSTEM_PROMPT =
  "あなたは英文中の特定の英単語の日本語訳を返す辞書アシスタントです。与えられた単語と（あれば）文脈に基づいて、その語が文中で持つ意味を日本語 1 行（最大 30 文字）で返してください。複数候補がある場合は文脈で最適なものに絞ってください。出力は意味本文のみ。Markdown・前置き・引用符・読み仮名は禁止。"

export async function POST(req: Request) {
  return withUser(async () => {
    const body = await req.json().catch(() => null)
    const parsed = LookupSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { word, sentence } = parsed.data

    let client
    try {
      client = getAnthropic()
    } catch (e) {
      return jsonError(
        503,
        "AI_UNAVAILABLE",
        e instanceof Error ? e.message : "AI service is unavailable",
      )
    }

    const userMessage = sentence
      ? `単語: ${word}\n文: ${sentence}`
      : `単語: ${word}`

    try {
      const response = await client.messages.create({
        model: AI_MODEL,
        max_tokens: 80,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      })

      const meaning = response.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("")
        .trim()

      return Response.json({ word, meaning })
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
