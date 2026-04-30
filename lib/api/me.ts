import { api } from "./client"
import type { Me } from "./types"

export const getMe = () => api.get<Me>("/api/me")

export const updateMe = (
  input: Partial<{
    displayName: string
    darkMode: boolean
    ttsLanguage: string
    reminderTime: string | null
    cloudSyncEnabled: boolean
  }>,
) => api.patch<Me>("/api/me", input)

export const signup = (input: {
  email: string
  password: string
  displayName: string
}) => api.post<{ user: { id: string; email: string; displayName: string } }>("/api/auth/signup", input)
