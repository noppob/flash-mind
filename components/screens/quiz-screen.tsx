"use client"

import { useState } from "react"
import { X, CheckCircle2, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const quizQuestions = [
  {
    id: "1",
    word: "unprecedented",
    correctAnswer: "前例のない",
    options: ["前例のない", "包括的な", "曖昧な", "かなりの"],
  },
  {
    id: "2",
    word: "comprehensive",
    correctAnswer: "包括的な",
    options: ["悪化する", "包括的な", "実装する", "深い"],
  },
  {
    id: "3",
    word: "deteriorate",
    correctAnswer: "悪化する",
    options: ["取得する", "前例のない", "悪化する", "かなりの"],
  },
  {
    id: "4",
    word: "substantial",
    correctAnswer: "かなりの",
    options: ["曖昧な", "かなりの", "包括的な", "実装する"],
  },
  {
    id: "5",
    word: "ambiguous",
    correctAnswer: "曖昧な",
    options: ["深い", "取得する", "前例のない", "曖昧な"],
  },
]

export function QuizScreen({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const question = quizQuestions[currentIndex]
  const progress = ((currentIndex) / quizQuestions.length) * 100
  const isCorrect = selectedAnswer === question.correctAnswer

  const handleAnswer = (answer: string) => {
    if (showFeedback) return
    setSelectedAnswer(answer)
    setShowFeedback(true)

    if (answer === question.correctAnswer) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowFeedback(false)

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const getOptionStyle = (option: string) => {
    if (!showFeedback) {
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-foreground">{correctCount}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {quizQuestions.length}
            </span>
          </div>
          <div className="w-8" />
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-5 pb-4">
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">この単語の意味は？</p>
          <h2 className="text-4xl font-bold text-foreground text-center">{question.word}</h2>
        </div>

        {/* Options */}
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
                {showFeedback && option === selectedAnswer && !isCorrect && option !== question.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback & Next */}
        {showFeedback && (
          <div className="animate-slide-up">
            <div className={`rounded-2xl p-4 mb-3 ${isCorrect ? "bg-emerald-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                  {isCorrect ? "正解！" : "不正解"}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm text-red-600 ml-7">
                  正解: {question.correctAnswer}
                </p>
              )}
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold active:scale-[0.98] transition-transform"
            >
              {currentIndex < quizQuestions.length - 1 ? "次の問題" : "結果を見る"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
