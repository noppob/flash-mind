import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { ImportUrlSchema } from "@/lib/validation/import"
import { fetchYouTubeTranscript } from "@/lib/imports/youtube"
import { extractPdfSentences } from "@/lib/imports/pdf"
import { translateLines } from "@/lib/imports/translate"
import type { ImportResult, TranscriptLine } from "@/lib/imports/types"

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

async function buildResult(
  userId: string,
  sourceType: "youtube" | "pdf" | "podcast",
  sourceUrl: string | null,
  title: string | null,
  durationSeconds: number | null,
  transcript: TranscriptLine[],
): Promise<ImportResult> {
  const created = await prisma.importedContent.create({
    data: {
      userId,
      sourceType,
      sourceUrl,
      title,
      durationSeconds,
      transcript: transcript as unknown as Prisma.InputJsonValue,
    },
  })
  return {
    id: created.id,
    sourceType,
    title,
    durationSeconds,
    transcript,
  }
}

export async function POST(req: Request) {
  return withUser(async ({ userId }) => {
    const contentType = req.headers.get("content-type") ?? ""

    // ─── PDF (multipart/form-data) ────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData().catch(() => null)
      if (!form) return jsonError(400, "BAD_REQUEST", "Invalid form data")
      const file = form.get("file")
      if (!(file instanceof File)) {
        return jsonError(400, "BAD_REQUEST", "file field is required")
      }
      if (file.size > MAX_PDF_BYTES) {
        return jsonError(413, "TOO_LARGE", "PDF is larger than 10 MB")
      }
      const buf = await file.arrayBuffer()
      try {
        const { sentences } = await extractPdfSentences(buf)
        if (sentences.length === 0) {
          return jsonError(
            422,
            "EMPTY_PDF",
            "PDF からテキストを抽出できませんでした（画像のみの PDF などの可能性）",
          )
        }
        const translations = await translateLines(sentences)
        const transcript: TranscriptLine[] = sentences.map((en, i) => ({
          time: i, // synthetic line index
          en,
          ja: translations[i] ?? "",
        }))
        const result = await buildResult(
          userId,
          "pdf",
          null,
          file.name || "PDF",
          null,
          transcript,
        )
        return Response.json(result, { status: 201 })
      } catch (e) {
        console.error("[imports/pdf]", e)
        return jsonError(
          502,
          "PDF_FAILED",
          e instanceof Error ? e.message : "PDF の解析に失敗しました",
        )
      }
    }

    // ─── URL-based: YouTube / Podcast (application/json) ──────────────────
    const body = await req.json().catch(() => null)
    const parsed = ImportUrlSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { type, url } = parsed.data

    if (type === "podcast") {
      // Phase 2: audio transcription is not yet wired (would need Whisper API
      // or self-hosted whisper.cpp). Return 501 so the UI can show a
      // friendly "近日対応" message instead of pretending to work.
      return jsonError(
        501,
        "NOT_IMPLEMENTED",
        "Podcast の書き起こしは近日対応予定です（Whisper 連携を計画中）",
      )
    }

    // YouTube
    try {
      const segments = await fetchYouTubeTranscript(url)
      // Group every ~10 seconds of segments into a single line for readability.
      const grouped: { time: number; en: string }[] = []
      const GROUP_SECONDS = 10
      let bucketStart = 0
      let bucketText: string[] = []
      for (const s of segments) {
        if (bucketText.length === 0) bucketStart = s.time
        bucketText.push(s.text)
        if (s.time - bucketStart >= GROUP_SECONDS) {
          grouped.push({ time: Math.round(bucketStart), en: bucketText.join(" ").trim() })
          bucketText = []
        }
      }
      if (bucketText.length > 0) {
        grouped.push({ time: Math.round(bucketStart), en: bucketText.join(" ").trim() })
      }

      const englishLines = grouped.map((g) => g.en)
      const translations = await translateLines(englishLines)
      const transcript: TranscriptLine[] = grouped.map((g, i) => ({
        time: g.time,
        en: g.en,
        ja: translations[i] ?? "",
      }))

      const last = grouped[grouped.length - 1]
      const result = await buildResult(
        userId,
        "youtube",
        url,
        null,
        last ? last.time + GROUP_SECONDS : null,
        transcript,
      )
      return Response.json(result, { status: 201 })
    } catch (e) {
      console.error("[imports/youtube]", e)
      return jsonError(
        502,
        "YOUTUBE_FAILED",
        e instanceof Error ? e.message : "YouTube からの取得に失敗しました",
      )
    }
  })
}
