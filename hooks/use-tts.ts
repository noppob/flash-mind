"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type TTSOptions = {
  lang?: string // default "en-US"
  rate?: number // 0.1 - 10, default 1
  pitch?: number // 0 - 2, default 1
}

// Wraps the browser's SpeechSynthesis API. Cancels any in-flight utterance
// before starting a new one so rapid taps don't queue up. Tracks whether the
// API is actually available — Capacitor's iOS WebView has it, but jsdom etc.
// will not.
export function useTTS() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true)
    }
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string, opts?: TTSOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      const trimmed = text.trim()
      if (!trimmed) return

      // Cancel any in-flight utterance first.
      window.speechSynthesis.cancel()

      const utt = new SpeechSynthesisUtterance(trimmed)
      utt.lang = opts?.lang ?? "en-US"
      utt.rate = opts?.rate ?? 1
      utt.pitch = opts?.pitch ?? 1
      utt.onstart = () => setSpeaking(true)
      utt.onend = () => setSpeaking(false)
      // Chrome fires "interrupted"/"canceled" when we cancel another utterance —
      // that's not a real error from the caller's POV, just clear the flag.
      utt.onerror = () => setSpeaking(false)

      utteranceRef.current = utt
      window.speechSynthesis.speak(utt)
    },
    [],
  )

  // Make sure we don't leave a half-spoken utterance if the component unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { supported, speaking, speak, cancel }
}
