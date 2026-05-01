import { api } from "./client"
import type { StatsOverview, WeakCard } from "./types"

export const getStatsOverview = () =>
  api.get<StatsOverview>("/api/stats/overview")

export const getWeakCards = (limit = 5) =>
  api.get<WeakCard[]>(`/api/stats/weak?limit=${limit}`)
