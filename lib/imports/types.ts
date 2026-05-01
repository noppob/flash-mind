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
