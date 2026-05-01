"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Sparkles, Loader2 } from "lucide-react"
import { signup } from "@/lib/api/me"

type Mode = "login" | "signup"

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("tanaka@email.com")
  const [password, setPassword] = useState("password123")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "signup") {
        await signup({ email, password, displayName: displayName || email })
      }
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError("メールまたはパスワードが正しくありません")
      } else {
        // SessionProvider が自動で再評価するので何もしない
        window.location.reload()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "サインアップに失敗しました",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">FlashMind</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "ログインして続ける" : "新しくはじめる"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名（任意）"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={password}
            required
            minLength={mode === "signup" ? 8 : 1}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "ログイン" : "アカウント作成"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode(mode === "login" ? "signup" : "login")
          }}
          className="mt-4 text-xs text-muted-foreground"
        >
          {mode === "login"
            ? "アカウントをお持ちでない方は サインアップ"
            : "すでにアカウントをお持ちの方は ログイン"}
        </button>

        <p className="mt-6 text-[11px] text-muted-foreground text-center leading-relaxed">
          開発用シードユーザー:
          <br />
          <span className="font-mono">tanaka@email.com</span> /{" "}
          <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  )
}
