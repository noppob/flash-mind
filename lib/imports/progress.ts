// Linear map: scale `done/total` into [from, to] percent for monotonic progress.
// Extracted so it can be unit-tested without pulling in the worker's Prisma /
// OpenAI dependencies.
export function progressMap(
  done: number,
  total: number,
  from: number,
  to: number,
): number {
  if (total <= 0) return to
  const ratio = Math.max(0, Math.min(1, done / total))
  return Math.round(from + (to - from) * ratio)
}
