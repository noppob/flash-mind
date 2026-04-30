"use client"

import { useState } from "react"
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
} from "lucide-react"

const settingSections = [
  {
    title: "\u30A2\u30AB\u30A6\u30F3\u30C8",
    items: [
      { icon: User, label: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB", value: "tanaka@email.com", action: true },
      { icon: Cloud, label: "\u30AF\u30E9\u30A6\u30C9\u540C\u671F", value: "\u6709\u52B9", action: true },
      { icon: Smartphone, label: "\u30C7\u30D0\u30A4\u30B9", value: "2\u53F0\u63A5\u7D9A\u4E2D", action: true },
    ],
  },
  {
    title: "\u30A4\u30F3\u30DD\u30FC\u30C8",
    items: [
      { icon: FolderPlus, label: "\u65B0\u898F\u30C7\u30C3\u30AD\u3092\u4F5C\u6210\u3057\u3066\u30A4\u30F3\u30DD\u30FC\u30C8", action: true },
      { icon: FolderInput, label: "\u65E2\u5B58\u306E\u30C7\u30C3\u30AD\u306B\u8FFD\u52A0", action: true },
    ],
  },
  {
    title: "\u5B66\u7FD2\u8A2D\u5B9A",
    items: [
      { icon: Bell, label: "\u30EA\u30DE\u30A4\u30F3\u30C0\u30FC", value: "\u6BCE\u65E5 8:00", action: true },
      { icon: Languages, label: "TTS\u8A00\u8A9E", value: "\u82F1\u8A9E (US)", action: true },
    ],
  },
  {
    title: "\u8868\u793A\u8A2D\u5B9A",
    items: [],
  },
  {
    title: "\u305D\u306E\u4ED6",
    items: [
      { icon: Shield, label: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC", action: true },
      { icon: HelpCircle, label: "\u30D8\u30EB\u30D7\u30FB\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF", action: true },
    ],
  },
]

export function SettingsScreen({ onImport }: { onImport?: () => void }) {
  const [darkMode, setDarkMode] = useState(false)
  const [showImportModal, setShowImportModal] = useState<"new" | "existing" | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-3">
        <h1 className="text-2xl font-bold text-foreground">{"\u8A2D\u5B9A"}</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Tanaka Yuki</h3>
            <p className="text-sm text-muted-foreground">{"Premium\u4F1A\u54E1"}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {settingSections.map((section) => (
          <div key={section.title} className="mb-5">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
              {section.title}
            </h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.title === "\u8868\u793A\u8A2D\u5B9A" && (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Sun className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground font-medium">{"\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9"}</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      darkMode ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        darkMode ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              )}
              {section.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.label}>
                    {(index > 0 || section.title === "\u8868\u793A\u8A2D\u5B9A") && (
                      <div className="h-px bg-border ml-12" />
                    )}
                    <button
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-secondary/50 transition-colors"
                      onClick={() => {
                        if (item.label === "\u65B0\u898F\u30C7\u30C3\u30AD\u3092\u4F5C\u6210\u3057\u3066\u30A4\u30F3\u30DD\u30FC\u30C8") {
                          setShowImportModal("new")
                        } else if (item.label === "\u65E2\u5B58\u306E\u30C7\u30C3\u30AD\u306B\u8FFD\u52A0") {
                          setShowImportModal("existing")
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {"value" in item && item.value && (
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        )}
                        {item.action && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button className="w-full bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center justify-center gap-2 mb-4 active:bg-secondary/50 transition-colors">
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive font-medium">{"\u30ED\u30B0\u30A2\u30A6\u30C8"}</span>
        </button>

        <p className="text-center text-xs text-muted-foreground mb-4">FlashMind v1.0.0</p>
      </div>

      {/* ─── Import Modal ─── */}
      {showImportModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={() => setShowImportModal(null)}>
          <div
            className="w-full bg-card rounded-t-3xl border-t border-border p-5 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              {showImportModal === "new" ? "\u65B0\u898F\u30C7\u30C3\u30AD\u3092\u4F5C\u6210" : "\u65E2\u5B58\u30C7\u30C3\u30AD\u306B\u8FFD\u52A0"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showImportModal === "new"
                ? "\u30A4\u30F3\u30DD\u30FC\u30C8\u3057\u305F\u30C7\u30FC\u30BF\u3067\u65B0\u3057\u3044\u30C7\u30C3\u30AD\u3092\u4F5C\u6210\u3057\u307E\u3059"
                : "\u30A4\u30F3\u30DD\u30FC\u30C8\u5148\u306E\u30C7\u30C3\u30AD\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"}
            </p>

            {showImportModal === "new" && (
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-1.5 block">{"\u30C7\u30C3\u30AD\u540D"}</label>
                <input
                  type="text"
                  placeholder={"\u4F8B: TOEIC \u982D\u51FA\u5358\u8A9E"}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {showImportModal === "existing" && (
              <div className="flex flex-col gap-2 mb-4">
                {["TOEIC \u983B\u51FA 800\u8A9E", "\u82F1\u691C\u6E961\u7D1A", "\u7D4C\u6E08\u7528\u8A9E \u57FA\u790E"].map((deck) => (
                  <button
                    key={deck}
                    className="flex items-center gap-3 bg-background rounded-xl border border-border px-4 py-3 text-left active:bg-secondary/50 transition-colors"
                  >
                    <FolderInput className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{deck}</span>
                  </button>
                ))}
              </div>
            )}

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
                  <span>{"\u30A4\u30F3\u30DD\u30FC\u30C8\u753B\u9762\u3078"}</span>
                </div>
              </button>
              <button
                onClick={() => setShowImportModal(null)}
                className="w-full py-3 text-sm text-muted-foreground font-medium"
              >
                {"\u30AD\u30E3\u30F3\u30BB\u30EB"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
