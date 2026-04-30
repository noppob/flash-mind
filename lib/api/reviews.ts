import { api } from "./client"
import type { ReviewItem, ReviewResult } from "./types"

export const submitReviews = (items: ReviewItem[]) =>
  api.post<ReviewResult>("/api/reviews", { items })
