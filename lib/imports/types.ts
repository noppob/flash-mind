// Shape returned to the client by /api/imports.
export type TranscriptLine = {
  time: number // seconds from start; for PDF this is just a synthetic line index
  en: string
  ja: string
}

export type ImportResult = {
  id: string
  sourceType: "pdf" | "podcast" | "youtube"
  title: string | null
  durationSeconds: number | null
  transcript: TranscriptLine[]
}

export type ImportJobStatus = {
  jobId: string
  status: "pending" | "running" | "done" | "error"
  progress: number // 0..100
  currentStep: "fetching" | "transcribing" | "translating" | "persisting" | null
  errorCode?: string
  errorMessage?: string
  result?: ImportResult
}
