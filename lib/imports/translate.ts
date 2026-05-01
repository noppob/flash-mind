import { getOpenAI, AI_MODEL } from "@/lib/openai"

const SYSTEM_PROMPT =
  'あなたは英文を自然な日本語に翻訳するアシスタントです。入力は { "lines": ["英文1", "英文2", ...] } という JSON。各英文を自然で簡潔な日本語訳に変換し、入力と同じ順序で { "translations": ["訳1", "訳2", ...] } という JSON で返してください。配列要素数は入力と必ず一致させること。'

type TranslateOpts = {
  // Called after each chunk completes. `done` is the number of input lines
  // processed so far, `total` is the total number to translate. Awaited so
  // callers can persist progress (e.g. ImportJob row updates) inline.
  onProgress?: (done: number, total: number) => void | Promise<void>
}

// Translate up to ~50 short English sentences in a single GPT call.
// Returns Japanese translations matching the input order; if the model output
// is malformed we fall back to empty strings (length-aligned).
export async function translateLines(
  lines: string[],
  opts?: TranslateOpts,
): Promise<string[]> {
  if (lines.length === 0) return []

  const client = getOpenAI()

  const CHUNK_SIZE = 40
  const out: string[] = []

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE)

    let translated: string[] = []
    try {
      const response = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ lines: chunk }) },
        ],
      })

      const text = response.choices[0]?.message?.content?.trim() ?? ""
      const parsed = JSON.parse(text) as { translations?: unknown }
      if (Array.isArray(parsed.translations)) {
        translated = parsed.translations.map((v) => (typeof v === "string" ? v : ""))
      }
    } catch (e) {
      console.error("[translateLines] chunk failed", e)
    }

    // Pad/truncate to chunk length so callers can rely on alignment.
    while (translated.length < chunk.length) translated.push("")
    if (translated.length > chunk.length) translated = translated.slice(0, chunk.length)
    out.push(...translated)

    if (opts?.onProgress) {
      await opts.onProgress(Math.min(i + CHUNK_SIZE, lines.length), lines.length)
    }
  }

  return out
}
