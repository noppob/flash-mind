import { extractText, getDocumentProxy } from "unpdf"

// Split a text blob into roughly sentence-sized chunks. Naive but good enough
// for vocabulary harvesting; we just need anchor points for the transcript UI.
export function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return []
  // Break on sentence-ending punctuation followed by space + capital letter.
  const parts = cleaned.split(/(?<=[.!?])\s+(?=[A-Z(])/g)
  return parts
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export async function extractPdfSentences(
  buffer: ArrayBuffer,
  maxSentences = 60,
): Promise<{ sentences: string[]; pageCount: number }> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  const merged = Array.isArray(text) ? text.join("\n") : text
  const sentences = splitIntoSentences(merged).slice(0, maxSentences)
  return { sentences, pageCount: pdf.numPages }
}
