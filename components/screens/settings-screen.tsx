"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import {
  User,
  Bell,
  Moon,
  Sun,
  Languages,
  Cloud,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Smartphone,
  Import,
  FolderPlus,
  FolderInput,
  Loader2,
} from "lucide-react"
import { getMe, updateMe } from "@/lib/api/me"
import type { Me } from "@/lib/api/types"

export function SettingsScreen({ onImport }: { onImport?: () => void }) {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState<"new" | "existing" | null>(null)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((data) => !cancelled && setMe(data))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggleDarkMode = async () => {
    if (!me) return
    const next = !me.darkMode
    setMe({ ...me, darkMode: next })
    try {
      await updateMe({ darkMode: next })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.reload()
  }

  if (loading || !me) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground">設定</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{me.displayName}</h3>
            <p className="text-sm text-muted-foreground">
              {me.plan === "premium" ? "Premium会員" : "Free プラン"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Account */}
        <Section title="アカウント">
          <Item icon={User} label="プロフィール" value={me.email} />
          <Item icon={Cloud} label="クラウド同期" value={me.cloudSyncEnabled ? "有効" : "無効"} />
          <Item icon={Smartphone} label="デバイス" value="1台接続中" />
        </Section>

        {/* Import */}
        <Section title="インポート">
          <Item
            icon={FolderPlus}
            label="新規デッキを作成してインポート"
            onClick={() => setShowImportModal("new")}
          />
          <Item
            icon={FolderInput}
            label="既存のデッキに追加"
            onClick={() => setShowImportModal("existing")}
          />
        </Section>

        {/* Learning settings */}
        <Section title="学習設定">
          <Item icon={Bell} label="リマインダー" value={me.reminderTime ?? "オフ"} />
          <Item icon={Languages} label="TTS言語" value={me.ttsLanguage} />
        </Section>

        {/* Display */}
        <Section title="表示設定">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              {me.darkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground font-medium">ダークモード</span>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                me.darkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  me.darkMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Section>

        {/* Other */}
        <Section title="その他">
          <Item icon={Shield} label="プライバシー" />
          <Item icon={HelpCircle} label="ヘルプ・フィードバック" />
        </Section>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center justify-center gap-2 mb-4 active:bg-secondary/50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive font-medium">ログアウト</span>
        </button>

        <p className="text-center text-xs text-muted-foreground mb-4">FlashMind v1.0.0</p>
      </div>

      {showImportModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/40"
          onClick={() => setShowImportModal(null)}
        >
          <div
            className="w-full bg-card rounded-t-3xl border-t border-border p-5 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              {showImportModal === "new" ? "新規デッキを作成" : "既存デッキに追加"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showImportModal === "new"
                ? "インポートしたデータで新しいデッキを作成します"
                : "インポート先のデッキを選んでください"}
            </p>

            <div className="flex flex-col gap-2">
              <button
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold active:scale-[0.98] transition-transform"
                onClick={() => {
                  setShowImportModal(null)
                  onImport?.()
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Import className="w-4 h-4" />
                  <span>インポート画面へ</span>
                </div>
              </button>
              <button
                onClick={() => setShowImportModal(null)}
                className="w-full py-3 text-sm text-muted-foreground font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
        {title}
      </h3>
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

function Item({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  )
}
