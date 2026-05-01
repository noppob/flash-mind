import { getAnthropic, AI_MODEL } from "@/lib/anthropic"

const SYSTEM_PROMPT =
  "あなたは英文を自然な日本語に翻訳するアシスタントです。入力は英文の JSON 配列。各英文を、自然で簡潔な日本語訳に変換し、入力と同じ順序で JSON 配列として返してください。出力は JSON 配列のみ。Markdown・前置き・コードフェンスは禁止。配列要素数は入力と必ず一致させること。"

// Translate up to ~50 short English sentences in a single Claude call.
// Returns Japanese translations matching the input order; if the model output
// is malformed we fall back to empty strings (length-aligned).
export async function translateLines(lines: string[]): Promise<string[]> {
  if (lines.length === 0) return []

  const client = getAnthropic()

  // Chunk if very long; Haiku 4.5 handles ~50 short sentences comfortably.
  const CHUNK_SIZE = 40
  const out: string[] = []

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE)
    const userMessage = JSON.stringify(chunk)

    let translated: string[] = []
    try {
      const response = await client.messages.create({
        model: AI_MODEL,
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      })

      const text = response.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("")
        .trim()

      const stripped = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()

      const parsed = JSON.parse(stripped)
      if (Array.isArray(parsed)) {
        translated = parsed.map((v) => (typeof v === "string" ? v : ""))
      }
    } catch (e) {
      console.error("[translateLines] chunk failed", e)
    }

    // Pad/truncate to chunk length so callers can rely on alignment.
    while (translated.length < chunk.length) translated.push("")
    if (translated.length > chunk.length) translated = translated.slice(0, chunk.length)
    out.push(...translated)
  }

  return out
}
