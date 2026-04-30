"use client"

import { useEffect, useMemo, useState } from "react"
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getDueCards } from "@/lib/api/decks"
import { submitReviews } from "@/lib/api/reviews"
import type { CardDetail, ReviewItem, ReviewResult } from "@/lib/api/types"

const QUIZ_LIMIT = 5

type Question = {
  cardId: string
  word: string
  correctAnswer: string
  options: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildQuestions(cards: CardDetail[]): Question[] {
  const pool = shuffle(cards).slice(0, QUIZ_LIMIT)
  const allMeanings = [...new Set(cards.map((c) => c.meaning))]
  return pool.map((card) => {
    const distractors = shuffle(allMeanings.filter((m) => m !== card.meaning)).slice(0, 3)
    const options = shuffle([card.meaning, ...distractors])
    return {
      cardId: card.id,
      word: card.word,
      correctAnswer: card.meaning,
      options,
    }
  })
}

export function QuizScreen({
  deckId,
  onClose,
  onComplete,
}: {
  deckId: string
  onClose: () => void
  onComplete: (result: ReviewResult) => void
}) {
  const [cards, setCards] = useState<CardDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDueCards(deckId, 30)
      .then((c) => !cancelled && setCards(c))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [deckId])

  const questions = useMemo(() => buildQuestions(cards), [cards])

  const question = questions[currentIndex]
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0
  const isCorrect = question && selectedAnswer === question.correctAnswer

  const handleAnswer = (answer: string) => {
    if (showFeedback || !question) return
    const correct = answer === question.correctAnswer
    setSelectedAnswer(answer)
    setShowFeedback(true)
    if (correct) setCorrectCount((c) => c + 1)
    setReviewItems((prev) => [
      ...prev,
      {
        cardId: question.cardId,
        mode: "quiz",
        rating: correct ? 5 : 2,
        correct,
      },
    ])
  }

  const handleNext = async () => {
    setSelectedAnswer(null)
    setShowFeedback(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setSubmitting(true)
      try {
        const result = await submitReviews(reviewItems)
        onComplete(result)
      } catch (e) {
        console.error(e)
        setSubmitting(false)
      }
    }
  }

  const getOptionStyle = (option: string) => {
    if (!showFeedback || !question) {
      return "bg-card border-border text-foreground"
    }
    if (option === question.correctAnswer) {
      return "bg-emerald-50 border-emerald-400 text-emerald-700"
    }
    if (option === selectedAnswer && !isCorrect) {
      return "bg-red-50 border-red-400 text-red-700"
    }
    return "bg-card border-border text-muted-foreground opacity-50"
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="pt-14 px-4 pb-3">
          <button onClick={onClose} className="flex items-center gap-0.5 text-primary">
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">閉じる</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          クイズを生成できませんでした
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-foreground">{correctCount}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-8" />
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex-1 flex flex-col px-5 pb-4">
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            この単語の意味は？
          </p>
          <h2 className="text-4xl font-bold text-foreground text-center">{question.word}</h2>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {question.options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${getOptionStyle(option)}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-base">{option}</span>
                {showFeedback && option === question.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                )}
                {showFeedback &&
                  option === selectedAnswer &&
                  !isCorrect &&
                  option !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
              </div>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className="animate-slide-up">
            <div className={`rounded-2xl p-4 mb-3 ${isCorrect ? "bg-emerald-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}
                >
                  {isCorrect ? "正解！" : "不正解"}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm text-red-600 ml-7">正解: {question.correctAnswer}</p>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentIndex < questions.length - 1 ? "次の問題" : "結果を見る"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
