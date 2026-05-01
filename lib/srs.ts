// SM-2 spaced repetition algorithm.
// Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
// rating: 0 (total blackout) – 5 (perfect recall)

export type SrsInput = {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export type SrsResult = SrsInput & {
  nextReviewAt: Date
  mastery: number
}

const DAY_MS = 86_400_000

export function sm2(prev: SrsInput, rating: number, now = new Date()): SrsResult {
  let { easeFactor, intervalDays, repetitions } = prev

  if (rating < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)),
    )
  }

  const nextReviewAt = new Date(now.getTime() + intervalDays * DAY_MS)

  // Map repetitions / interval to a 1..5 mastery indicator for the UI.
  let mastery: number
  if (rating < 3) mastery = 1
  else if (repetitions <= 1) mastery = 2
  else if (repetitions === 2) mastery = 3
  else if (intervalDays < 21) mastery = 4
  else mastery = 5

  return { easeFactor, intervalDays, repetitions, nextReviewAt, mastery }
}

// Convert a quiz answer (correct / incorrect) into an SM-2 rating.
export function quizRating(correct: boolean): number {
  return correct ? 5 : 2
}

// Convert a flashcard self-judgement into an SM-2 rating.
export function flashcardRating(remembered: boolean): number {
  return remembered ? 5 : 2
}
