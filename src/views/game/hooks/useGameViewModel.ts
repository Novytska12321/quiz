import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ResultLocationState } from '../api/ResultLocationState'
import { useTriviaQuery } from './useTriviaQuery'

const ADVANCE_DELAY_MS = 3000
const QUESTIONS_TOTAL = 5

export type GameUiState = 'loading' | 'ready' | 'answered' | 'error'

export function useGameViewModel() {
  const navigate = useNavigate()
  const { data: questions, isPending, isError, error, refetch, isFetching } =
    useTriviaQuery()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  useEffect(() => () => clearAdvanceTimeout(), [])

  const resetRoundState = () => {
    clearAdvanceTimeout()
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  const uiState: GameUiState =
    isPending || (isFetching && !questions)
      ? 'loading'
      : isError
        ? 'error'
        : selectedAnswer !== null
          ? 'answered'
          : 'ready'

  const currentQuestion = questions?.[currentIndex] ?? null
  const progressCurrent = questions ? currentIndex + 1 : 0
  const progressTotal = questions?.length ?? QUESTIONS_TOTAL

  const answerQuestion = (answer: string) => {
    if (!currentQuestion || selectedAnswer !== null) return

    const correct = answer === currentQuestion.correctAnswer
    setSelectedAnswer(answer)
    setIsCorrect(correct)

    const nextScore = correct ? score + 1 : score
    if (correct) {
      setScore(nextScore)
    }

    advanceTimeoutRef.current = setTimeout(() => {
      const isLast = currentIndex >= (questions?.length ?? QUESTIONS_TOTAL) - 1
      if (isLast) {
        navigate('/result', {
          state: { score: nextScore, total: QUESTIONS_TOTAL } satisfies ResultLocationState,
        })
        return
      }

      setCurrentIndex((index) => index + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }, ADVANCE_DELAY_MS)
  }

  const quit = () => {
    clearAdvanceTimeout()
    navigate('/')
  }

  const retry = async () => {
    resetRoundState()
    await refetch()
  }

  return {
    uiState,
    currentQuestion,
    progressCurrent,
    progressTotal,
    score,
    selectedAnswer,
    isCorrect,
    errorMessage: error instanceof Error ? error.message : 'Something went wrong.',
    answerQuestion,
    quit,
    retry,
  }
}
