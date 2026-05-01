import OpenAI from "openai"

let cached: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (cached) return cached
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Required for podcast transcription via Whisper API.",
    )
  }
  cached = new OpenAI({ apiKey })
  return cached
}

// Default text/chat model used by /api/ai/* and translation. Centralised so a
// single edit lets us bump models for the whole app.
export const AI_MODEL = "gpt-4.1-mini"

// Audio transcription model. We use Whisper (transcriptions, not translations)
// so non-English audio gets a same-language transcript that the translation
// step can render into Japanese.
export const WHISPER_MODEL = "whisper-1"
