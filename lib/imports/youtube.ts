import { YoutubeTranscript } from "youtube-transcript"

export type RawSegment = { time: number; text: string }

export function extractYouTubeId(url: string): string | null {
  // Handles: youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/shorts/<id>,
  // youtube.com/embed/<id>, youtube.com/live/<id>.
  const trimmed = url.trim()
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/(?:shorts|embed|live|v)\/([\w-]{11})/,
    /^([\w-]{11})$/,
  ]
  for (const re of patterns) {
    const m = trimmed.match(re)
    if (m) return m[1]
  }
  return null
}

// Fetch English captions if available, otherwise fallback to whatever YouTube
// auto-suggests. Returns segments with start time (seconds) + raw English text.
export async function fetchYouTubeTranscript(
  videoIdOrUrl: string,
): Promise<RawSegment[]> {
  const id = extractYouTubeId(videoIdOrUrl) ?? videoIdOrUrl
  const tryFetch = async (lang?: string) => {
    try {
      return await YoutubeTranscript.fetchTranscript(id, lang ? { lang } : undefined)
    } catch {
      return null
    }
  }

  const items =
    (await tryFetch("en")) ?? (await tryFetch())

  if (!items || items.length === 0) {
    throw new Error(
      "字幕が取得できませんでした。動画に英語字幕（自動生成を含む）が無い可能性があります。",
    )
  }

  const decode = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))

  return items.map((it) => ({
    time: Math.round(it.offset),
    text: decode(it.text).replace(/\s+/g, " ").trim(),
  }))
}
