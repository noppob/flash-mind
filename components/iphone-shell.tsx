"use client"

import { type ReactNode, useEffect, useState, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

// 既定では md (768px) 以上のとき枠を表示する。
// `?frame=on` で常に表示、`?frame=off` で常に非表示に上書きできる。
const DESKTOP_QUERY = "(min-width: 768px)"

function subscribeViewport(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

const getViewportSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches
// SSR では枠ありのレイアウトを既定値にする（既存の見た目を維持してハイドレーションのチラつきを抑える）
const getViewportServerSnapshot = () => true

export function IPhoneShell({ children }: { children: ReactNode }) {
  const isDesktop = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    getViewportServerSnapshot,
  )

  // ?frame=on / ?frame=off による上書き。
  // useSearchParams は静的プリレンダ時に Suspense 境界を要求するので避け、マウント後に window から読む。
  const [frameOverride, setFrameOverride] = useState<"on" | "off" | null>(null)
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("frame")
    if (v === "on" || v === "off") setFrameOverride(v)
  }, [])

  const showFrame =
    frameOverride === "on" ? true : frameOverride === "off" ? false : isDesktop

  return (
    <div
      className={cn(
        showFrame
          ? "flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4"
          : "h-screen w-screen bg-background",
      )}
    >
      <div
        className={cn(
          "relative bg-background overflow-hidden",
          showFrame
            ? "w-[390px] h-[844px] rounded-[55px] bg-black p-[14px] shadow-2xl shadow-black/50"
            : "w-full h-full",
        )}
      >
        {showFrame && (
          <>
            <div className="absolute inset-0 rounded-[55px] border border-slate-600/30 pointer-events-none" />
            <div className="absolute left-[-3px] top-[160px] w-[3px] h-[32px] bg-slate-700 rounded-l-sm" />
            <div className="absolute left-[-3px] top-[220px] w-[3px] h-[64px] bg-slate-700 rounded-l-sm" />
            <div className="absolute left-[-3px] top-[296px] w-[3px] h-[64px] bg-slate-700 rounded-l-sm" />
            <div className="absolute right-[-3px] top-[240px] w-[3px] h-[80px] bg-slate-700 rounded-r-sm" />
          </>
        )}

        <div
          className={cn(
            "relative w-full h-full bg-background overflow-hidden",
            showFrame && "rounded-[42px]",
          )}
        >
          {showFrame && (
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-3">
              <div className="w-[126px] h-[37px] bg-black rounded-full" />
            </div>
          )}

          <div className="h-full overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  )
}
