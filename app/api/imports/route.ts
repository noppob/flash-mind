import { after } from "next/server"
import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { ImportUrlSchema } from "@/lib/validation/import"
import { runImportJob } from "@/lib/imports/worker"

// Long-running because the worker is dispatched via `after()` and shares this
// invocation's compute window. Requires Vercel Pro+ in production.
export const runtime = "nodejs"
export const maxDuration = 300

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_PODCAST_BYTES = 25 * 1024 * 1024 // OpenAI Whisper API limit

type Accepted = { jobId: string }

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
      const buffer = await file.arrayBuffer()
      const title = file.name || "PDF"

      const job = await prisma.importJob.create({
        data: {
          userId,
          sourceType: "pdf",
          sourceUrl: null,
          title,
          status: "pending",
          progress: 0,
        },
      })

      after(() =>
        runImportJob({
          jobId: job.id,
          sourceType: "pdf",
          payload: { userId, buffer, title },
        }),
      )

      return Response.json({ jobId: job.id } satisfies Accepted, { status: 202 })
    }

    // ─── URL-based: YouTube / Podcast (application/json) ──────────────────
    const body = await req.json().catch(() => null)
    const parsed = ImportUrlSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { type, url } = parsed.data

    if (type === "podcast") {
      // Pre-flight checks so we don't create a Job that we know will fail.
      if (!process.env.OPENAI_API_KEY) {
        return jsonError(
          503,
          "OPENAI_KEY_MISSING",
          "OPENAI_API_KEY が未設定のため Podcast 取込は無効です",
        )
      }
      const head = await fetch(url, { method: "HEAD" }).catch(() => null)
      if (head?.ok) {
        const len = Number(head.headers.get("content-length") ?? "0")
        if (len > MAX_PODCAST_BYTES) {
          return jsonError(413, "TOO_LARGE", "音声ファイルが 25MB を超えています")
        }
      }
    }

    const job = await prisma.importJob.create({
      data: {
        userId,
        sourceType: type,
        sourceUrl: url,
        title: null,
        status: "pending",
        progress: 0,
      },
    })

    after(() =>
      runImportJob({
        jobId: job.id,
        sourceType: type,
        payload: { userId, url },
      }),
    )

    return Response.json({ jobId: job.id } satisfies Accepted, { status: 202 })
  })
}
