"use client"

import { Home, Search, Plus, BarChart3, Settings } from "lucide-react"

type TabId = "home" | "explore" | "import" | "stats" | "settings"

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "ホーム", icon: Home },
  { id: "explore", label: "探す", icon: Search },
  { id: "import", label: "取込", icon: Plus },
  { id: "stats", label: "統計", icon: BarChart3 },
  { id: "settings", label: "設定", icon: Settings },
]

export function BottomTabs({
  active,
  onTabChange,
}: {
  active: TabId
  onTabChange: (tab: TabId) => void
}) {
  return (
    <div className="flex items-end justify-around px-2 pb-7 pt-2 bg-card/80 backdrop-blur-xl border-t border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.id
        const isImport = tab.id === "import"

        if (isImport) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 -mt-3"
              aria-label={tab.label}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium text-primary">
                {tab.label}
              </span>
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 py-1"
            aria-label={tab.label}
          >
            <Icon
              className={`w-[22px] h-[22px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
