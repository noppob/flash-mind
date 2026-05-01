import { api, apiFetch } from "./client"
import type { ImportJobStatus } from "@/lib/imports/types"

export type ImportSourceType = "youtube" | "podcast"

export const createImportFromUrl = (type: ImportSourceType, url: string) =>
  api.post<{ jobId: string }>("/api/imports", { type, url })

export const createImportFromPdf = (file: File) => {
  const form = new FormData()
  form.append("file", file)
  return apiFetch<{ jobId: string }>("/api/imports", {
    method: "POST",
    body: form,
  })
}

export const getImportJob = (jobId: string) =>
  api.get<ImportJobStatus>(`/api/imports/${encodeURIComponent(jobId)}`)
