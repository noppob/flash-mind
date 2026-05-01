"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
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
import { DictionaryScreen } from "@/components/screens/dictionary-screen"
import { LoginScreen } from "@/components/screens/login-screen"
import type { ReviewResult } from "@/lib/api/types"

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
  | "dictionary"

type TabId = "home" | "explore" | "import" | "stats" | "settings"

const tabScreens: TabId[] = ["home", "explore", "import", "stats", "settings"]

export default function Page() {
  const { status } = useSession()

  const [screen, setScreen] = useState<Screen>("home")
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [previousScreen, setPreviousScreen] = useState<Screen>("home")
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [resultData, setResultData] = useState<ReviewResult | null>(null)
  // 辞書から「カード化」したときに card-edit に渡す単語
  const [pendingInitialWord, setPendingInitialWord] = useState<string | null>(null)

  const navigate = useCallback(
    (to: Screen) => {
      setPreviousScreen(screen)
      setScreen(to)
    },
    [screen],
  )

  const goBack = useCallback(() => {
    setScreen(previousScreen)
  }, [previousScreen])

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setScreen(tab as Screen)
  }, [])

  const handleDeckSelect = useCallback(
    (deckId: string) => {
      setSelectedDeckId(deckId)
      navigate("deck-detail")
    },
    [navigate],
  )

  const handleCardEdit = useCallback(
    (cardId: string | null) => {
      setSelectedCardId(cardId)
      setPendingInitialWord(null)
      navigate("card-edit")
    },
    [navigate],
  )

  const handleCreateCardFromDictionary = useCallback(
    (deckId: string, word: string) => {
      setSelectedDeckId(deckId)
      setSelectedCardId(null)
      setPendingInitialWord(word)
      navigate("card-edit")
    },
    [navigate],
  )

  const handleSessionComplete = useCallback(
    (result: ReviewResult) => {
      setResultData(result)
      navigate("results")
    },
    [navigate],
  )

  if (status === "loading") {
    return (
      <IPhoneShell>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </IPhoneShell>
    )
  }

  if (status === "unauthenticated") {
    return (
      <IPhoneShell>
        <LoginScreen />
      </IPhoneShell>
    )
  }

  const showTabs = tabScreens.includes(screen as TabId)

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onDeckSelect={handleDeckSelect}
            onOpenDictionary={() => navigate("dictionary")}
          />
        )
      case "deck-detail":
        if (!selectedDeckId) return <HomeScreen onDeckSelect={handleDeckSelect} />
        return (
          <DeckDetailScreen
            deckId={selectedDeckId}
            onBack={() => setScreen("home")}
            onStartFlashcard={() => navigate("flashcard")}
            onStartQuiz={() => navigate("quiz")}
            onCardEdit={handleCardEdit}
            onCardList={() => navigate("card-list")}
          />
        )
      case "flashcard":
        if (!selectedDeckId) return <HomeScreen onDeckSelect={handleDeckSelect} />
        return (
          <FlashcardScreen
            deckId={selectedDeckId}
            onClose={() => setScreen("deck-detail")}
            onComplete={handleSessionComplete}
          />
        )
      case "quiz":
        if (!selectedDeckId) return <HomeScreen onDeckSelect={handleDeckSelect} />
        return (
          <QuizScreen
            deckId={selectedDeckId}
            onClose={() => setScreen("deck-detail")}
            onComplete={handleSessionComplete}
          />
        )
      case "results":
        return (
          <ResultsScreen
            result={resultData}
            onRetry={() => setScreen("flashcard")}
            onHome={() => {
              setActiveTab("home")
              setScreen("home")
            }}
          />
        )
      case "explore":
        return <ExploreScreen onDeckImported={handleDeckSelect} />
      case "import":
        return <ImportScreen />
      case "stats":
        return <StatsScreen />
      case "settings":
        return (
          <SettingsScreen
            onImport={() => {
              setActiveTab("import")
              setScreen("import")
            }}
          />
        )
      case "card-edit":
        if (!selectedDeckId) return <HomeScreen onDeckSelect={handleDeckSelect} />
        return (
          <CardEditScreen
            deckId={selectedDeckId}
            cardId={selectedCardId}
            initialWord={pendingInitialWord ?? undefined}
            onBack={() => {
              setPendingInitialWord(null)
              goBack()
            }}
          />
        )
      case "card-list":
        if (!selectedDeckId) return <HomeScreen onDeckSelect={handleDeckSelect} />
        return (
          <CardListScreen
            deckId={selectedDeckId}
            onBack={() => setScreen("deck-detail")}
            onCardEdit={handleCardEdit}
          />
        )
      case "dictionary":
        return (
          <DictionaryScreen
            onBack={goBack}
            onCreateCard={handleCreateCardFromDictionary}
          />
        )
      default:
        return <HomeScreen onDeckSelect={handleDeckSelect} />
    }
  }

  return (
    <IPhoneShell>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">{renderScreen()}</div>
        {showTabs && (
          <BottomTabs active={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </IPhoneShell>
  )
}
