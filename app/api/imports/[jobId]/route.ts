import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import type { ImportJobStatus, ImportResult, TranscriptLine } from "@/lib/imports/types"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  return withUser(async ({ userId }) => {
    const { jobId } = await params
    const job = await prisma.importJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    })

    // Return 404 (not 403) when the job belongs to someone else, so we don't
    // leak the existence of foreign job IDs.
    if (!job || job.userId !== userId) {
      return jsonError(404, "NOT_FOUND", "Import job not found")
    }

    const body: ImportJobStatus = {
      jobId: job.id,
      status: job.status as ImportJobStatus["status"],
      progress: job.progress,
      currentStep: (job.currentStep ?? null) as ImportJobStatus["currentStep"],
    }
    if (job.errorCode) body.errorCode = job.errorCode
    if (job.errorMessage) body.errorMessage = job.errorMessage

    if (job.status === "done" && job.result) {
      const result: ImportResult = {
        id: job.result.id,
        sourceType: job.result.sourceType as ImportResult["sourceType"],
        title: job.result.title,
        durationSeconds: job.result.durationSeconds,
        transcript: job.result.transcript as unknown as TranscriptLine[],
      }
      body.result = result
    }

    return Response.json(body)
  })
}
