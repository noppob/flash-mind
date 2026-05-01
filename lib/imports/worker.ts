import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { extractPdfSentences } from "./pdf"
import { fetchYouTubeTranscript } from "./youtube"
import { fetchPodcastTranscript } from "./podcast"
import { translateLines } from "./translate"
import { groupSegmentsBy10Seconds, GROUP_BUCKET_SECONDS } from "./group"
import type { TranscriptLine } from "./types"

type WorkerPayload = {
  userId: string
  url?: string
  buffer?: ArrayBuffer
  title?: string | null
}

type WorkerArgs = {
  jobId: string
  sourceType: "pdf" | "youtube" | "podcast"
  payload: WorkerPayload
}

type CurrentStep = "fetching" | "transcribing" | "translating" | "persisting"

async function updateJob(
  jobId: string,
  patch: {
    status?: "pending" | "running" | "done" | "error"
    progress?: number
    currentStep?: CurrentStep | null
    resultId?: string | null
    errorCode?: string | null
    errorMessage?: string | null
  },
): Promise<void> {
  try {
    await prisma.importJob.update({ where: { id: jobId }, data: patch })
  } catch (e) {
    console.error("[worker] updateJob failed", { jobId, e })
  }
}

// Linear map: scale `done/total` into [from, to] percent for monotonic progress.
function progressMap(done: number, total: number, from: number, to: number): number {
  if (total <= 0) return to
  const ratio = Math.max(0, Math.min(1, done / total))
  return Math.round(from + (to - from) * ratio)
}

export async function runImportJob({ jobId, sourceType, payload }: WorkerArgs): Promise<void> {
  await updateJob(jobId, { status: "running", progress: 5, currentStep: "fetching" })

  try {
    let transcript: TranscriptLine[]
    let durationSeconds: number | null = null

    if (sourceType === "pdf") {
      if (!payload.buffer) throw new Error("PDF buffer is missing")
      const { sentences } = await extractPdfSentences(payload.buffer)
      if (sentences.length === 0) {
        throw Object.assign(new Error("PDF からテキストを抽出できませんでした"), {
          code: "EMPTY_PDF",
        })
      }
      await updateJob(jobId, { progress: 15, currentStep: "translating" })
      const translations = await translateLines(sentences, {
        onProgress: async (done, total) => {
          await updateJob(jobId, { progress: progressMap(done, total, 15, 85) })
        },
      })
      transcript = sentences.map((en, i) => ({ time: i, en, ja: translations[i] ?? "" }))
    } else if (sourceType === "youtube") {
      if (!payload.url) throw new Error("YouTube URL is missing")
      const segments = await fetchYouTubeTranscript(payload.url)
      await updateJob(jobId, { progress: 35, currentStep: "translating" })
      const grouped = groupSegmentsBy10Seconds(segments)
      const englishLines = grouped.map((g) => g.en)
      const translations = await translateLines(englishLines, {
        onProgress: async (done, total) => {
          await updateJob(jobId, { progress: progressMap(done, total, 35, 85) })
        },
      })
      transcript = grouped.map((g, i) => ({
        time: g.time,
        en: g.en,
        ja: translations[i] ?? "",
      }))
      const last = grouped[grouped.length - 1]
      durationSeconds = last ? last.time + GROUP_BUCKET_SECONDS : null
    } else {
      // Podcast: download → Whisper → translate
      if (!payload.url) throw new Error("Podcast URL is missing")
      await updateJob(jobId, { progress: 20, currentStep: "transcribing" })
      const segments = await fetchPodcastTranscript(payload.url)
      await updateJob(jobId, { progress: 60, currentStep: "translating" })
      const grouped = groupSegmentsBy10Seconds(segments)
      const englishLines = grouped.map((g) => g.en)
      const translations = await translateLines(englishLines, {
        onProgress: async (done, total) => {
          await updateJob(jobId, { progress: progressMap(done, total, 60, 85) })
        },
      })
      transcript = grouped.map((g, i) => ({
        time: g.time,
        en: g.en,
        ja: translations[i] ?? "",
      }))
      const last = grouped[grouped.length - 1]
      durationSeconds = last ? last.time + GROUP_BUCKET_SECONDS : null
    }

    await updateJob(jobId, { progress: 90, currentStep: "persisting" })

    const created = await prisma.importedContent.create({
      data: {
        userId: payload.userId,
        sourceType,
        sourceUrl: payload.url ?? null,
        title: payload.title ?? null,
        durationSeconds,
        transcript: transcript as unknown as Prisma.InputJsonValue,
      },
    })

    await updateJob(jobId, {
      status: "done",
      progress: 100,
      currentStep: null,
      resultId: created.id,
    })
  } catch (e) {
    console.error("[worker] job failed", { jobId, sourceType, e })
    const err = e as { code?: string; message?: string }
    const errorCode =
      err.code ??
      (sourceType === "pdf"
        ? "PDF_FAILED"
        : sourceType === "youtube"
          ? "YOUTUBE_FAILED"
          : "PODCAST_FAILED")
    await updateJob(jobId, {
      status: "error",
      currentStep: null,
      errorCode,
      errorMessage: err.message ?? "Unknown error",
    })
  }
}
