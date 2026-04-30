"use client"

import { useState, useCallback } from "react"
import { IPhoneShell } from "@/components/iphone-shell"
import { BottomTabs } from "@/components/bottom-tabs"
import { HomeScreen } from "@/components/screens/home-screen"
import { DeckDetailScreen } from "@/components/screens/deck-detail-screen"
import { FlashcardScreen } from "@/components/screens/flashcard-screen"
import { QuizScreen } from "@/components/screens/quiz-screen"
import { ResultsScreen } from "@/components/screens/results-screen"
import { ExploreScreen } from "@/components/screens/explore-screen"
import { ImportScreen } from "@/components/screens/import-screen"
import { StatsScreen } from "@/components/screens/stats-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { CardEditScreen } from "@/components/screens/card-edit-screen"
import { CardListScreen } from "@/components/screens/card-list-screen"

type Screen =
  | "home"
  | "deck-detail"
  | "flashcard"
  | "quiz"
  | "results"
  | "explore"
  | "import"
  | "stats"
  | "settings"
  | "card-edit"
  | "card-list"

type TabId = "home" | "explore" | "import" | "stats" | "settings"

const tabScreens: TabId[] = ["home", "explore", "import", "stats", "settings"]

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home")
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [previousScreen, setPreviousScreen] = useState<Screen>("home")

  const navigate = useCallback(
    (to: Screen) => {
      setPreviousScreen(screen)
      setScreen(to)
    },
    [screen]
  )

  const goBack = useCallback(() => {
    setScreen(previousScreen)
  }, [previousScreen])

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setScreen(tab as Screen)
  }, [])

  // Check if current screen should show bottom tabs
  const showTabs = tabScreens.includes(screen as TabId)

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onDeckSelect={() => navigate("deck-detail")}
          />
        )
      case "deck-detail":
        return (
          <DeckDetailScreen
            onBack={() => setScreen("home")}
            onStartFlashcard={() => navigate("flashcard")}
            onStartQuiz={() => navigate("quiz")}
            onCardEdit={() => navigate("card-edit")}
            onCardList={() => navigate("card-list")}
          />
        )
      case "flashcard":
        return (
          <FlashcardScreen
            onClose={() => setScreen("deck-detail")}
            onComplete={() => navigate("results")}
          />
        )
      case "quiz":
        return (
          <QuizScreen
            onClose={() => setScreen("deck-detail")}
            onComplete={() => navigate("results")}
          />
        )
      case "results":
        return (
          <ResultsScreen
            onRetry={() => setScreen("flashcard")}
            onHome={() => {
              setActiveTab("home")
              setScreen("home")
            }}
          />
        )
      case "explore":
        return <ExploreScreen />
      case "import":
        return <ImportScreen />
      case "stats":
        return <StatsScreen />
      case "settings":
        return <SettingsScreen onImport={() => { setActiveTab("import" as TabId); setScreen("import") }} />
      case "card-edit":
        return <CardEditScreen onBack={goBack} />
      case "card-list":
        return <CardListScreen onBack={() => setScreen("deck-detail")} />
      default:
        return <HomeScreen onDeckSelect={() => navigate("deck-detail")} />
    }
  }

  return (
    <IPhoneShell>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>
        {showTabs && (
          <BottomTabs active={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </IPhoneShell>
  )
}
