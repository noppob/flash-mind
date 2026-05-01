import type { RawSegment } from "./youtube"

const GROUP_SECONDS = 10

// Bucket raw timestamped segments into ~10-second groups so the transcript UI
// has a manageable number of lines. Reused by YouTube and Podcast paths.
export function groupSegmentsBy10Seconds(
  segments: RawSegment[],
): { time: number; en: string }[] {
  const out: { time: number; en: string }[] = []
  let bucketStart = 0
  let bucketText: string[] = []

  for (const s of segments) {
    if (bucketText.length === 0) bucketStart = s.time
    bucketText.push(s.text)
    if (s.time - bucketStart >= GROUP_SECONDS) {
      out.push({ time: Math.round(bucketStart), en: bucketText.join(" ").trim() })
      bucketText = []
    }
  }
  if (bucketText.length > 0) {
    out.push({ time: Math.round(bucketStart), en: bucketText.join(" ").trim() })
  }
  return out
}

export const GROUP_BUCKET_SECONDS = GROUP_SECONDS
