import { getOpenAI, WHISPER_MODEL } from "@/lib/openai"
import type { RawSegment } from "./youtube"

const MAX_BYTES = 25 * 1024 * 1024 // OpenAI Whisper API per-file limit
const ALLOWED_PREFIX = "audio/"

function filenameFromUrl(url: string, contentType: string): string {
  const ext =
    contentType.includes("mpeg") || contentType.includes("mp3")
      ? "mp3"
      : contentType.includes("wav")
        ? "wav"
        : contentType.includes("ogg")
          ? "ogg"
          : contentType.includes("m4a") || contentType.includes("mp4")
            ? "m4a"
            : "mp3"
  try {
    const u = new URL(url)
    const last = u.pathname.split("/").filter(Boolean).pop()
    if (last && /\.[a-z0-9]+$/i.test(last)) return last
  } catch {
    /* fall through */
  }
  return `audio.${ext}`
}

export async function fetchPodcastTranscript(url: string): Promise<RawSegment[]> {
  // HEAD pre-check to bail out early on oversize files. We still re-check the
  // actual byte length after download to defend against missing/lying headers.
  const head = await fetch(url, { method: "HEAD" }).catch(() => null)
  if (head?.ok) {
    const len = Number(head.headers.get("content-length") ?? "0")
    if (len > MAX_BYTES) {
      throw Object.assign(new Error("音声ファイルが 25MB を超えています"), {
        code: "TOO_LARGE",
      })
    }
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw Object.assign(new Error(`音声ファイルの取得に失敗しました (${res.status})`), {
      code: "PODCAST_FETCH_FAILED",
    })
  }
  const contentType = (res.headers.get("content-type") ?? "").toLowerCase()
  if (!contentType.startsWith(ALLOWED_PREFIX)) {
    throw Object.assign(
      new Error(`音声ファイルではありません (content-type=${contentType || "?"})`),
      { code: "PODCAST_NOT_AUDIO" },
    )
  }

  const buf = await res.arrayBuffer()
  if (buf.byteLength > MAX_BYTES) {
    throw Object.assign(new Error("音声ファイルが 25MB を超えています"), {
      code: "TOO_LARGE",
    })
  }

  const file = new File([new Uint8Array(buf)], filenameFromUrl(url, contentType), {
    type: contentType,
  })

  const client = getOpenAI()
  const result = await client.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  })

  const segments = (result as unknown as { segments?: { start: number; text: string }[] })
    .segments
  if (!segments || segments.length === 0) {
    throw Object.assign(new Error("音声から書き起こしを生成できませんでした"), {
      code: "PODCAST_EMPTY",
    })
  }

  return segments.map((s) => ({
    time: Math.round(s.start),
    text: s.text.trim(),
  }))
}
