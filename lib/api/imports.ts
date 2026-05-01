import { api, apiFetch } from "./client"
import type { ImportResult } from "@/lib/imports/types"

export const importFromUrl = (
  type: "youtube" | "podcast",
  url: string,
) => api.post<ImportResult>("/api/imports", { type, url })

export const importPdf = (file: File) => {
  const form = new FormData()
  form.append("file", file)
  return apiFetch<ImportResult>("/api/imports", {
    method: "POST",
    body: form,
  })
}
