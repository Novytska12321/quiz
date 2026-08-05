import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ResultLocationState } from '../api/ResultLocationState'
import {
  globalProgressCurrent,
  hasNextLevel,
  isLastQuestionInLevel,
  LEVELS,
  levelLabel,
  TOTAL_QUESTIONS,
} from '../domain/levels'
import { MAX_SCORE, pointsForCorrectAnswer } from '../domain/scoring'
import { useTriviaQuery } from './useTriviaQuery'

const ADVANCE_DELAY_MS = 3000
const RATE_LIMIT_MS = 5000

export type GameUiState = 'loading' | 'ready' | 'answered' | 'error'

export function useGameViewModel() {
  const navigate = useNavigate()
  const [levelIndex, setLevelIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isAdvancingLevel, setIsAdvancingLevel] = useState(false)

  const difficulty = LEVELS[levelIndex] ?? LEVELS[0]
  const {
    data: questions,
    isPending,
    isError,
    isSuccess,
    error,
    refetch,
    isFetching,
  } = useTriviaQuery({ difficulty })

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rateLimitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchAtRef = useRef(0)

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  const clearRateLimitTimeout = () => {
    if (rateLimitTimeoutRef.current !== null) {
      clearTimeout(rateLimitTimeoutRef.current)
      rateLimitTimeoutRef.current = null
    }
  }

  const clearTimers = () => {
    clearAdvanceTimeout()
    clearRateLimitTimeout()
  }

  useEffect(
    () => () => {
      if (advanceTimeoutRef.current !== null) {
        clearTimeout(advanceTimeoutRef.current)
      }
      if (rateLimitTimeoutRef.current !== null) {
        clearTimeout(rateLimitTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (isSuccess && questions) {
      lastFetchAtRef.current = Date.now()
    }
  }, [isSuccess, questions])

  const uiState: GameUiState =
    isAdvancingLevel || isPending || (isFetching && !questions)
      ? 'loading'
      : isError
        ? 'error'
        : selectedAnswer !== null
          ? 'answered'
          : 'ready'

  const currentQuestion = questions?.[questionIndex] ?? null
  const progressCurrent = globalProgressCurrent(levelIndex, questionIndex)
  const progressTotal = TOTAL_QUESTIONS
  const loadingDifficulty =
    isAdvancingLevel && hasNextLevel(levelIndex)
      ? LEVELS[levelIndex + 1]
      : difficulty
  const currentLevelLabel = levelLabel(difficulty)
  const loadingLevelLabel = levelLabel(loadingDifficulty)

  const advanceToNextLevel = () => {
    setSelectedAnswer(null)
    setIsCorrect(null)
    setIsAdvancingLevel(true)

    const elapsed = Date.now() - lastFetchAtRef.current
    const waitMs = Math.max(0, RATE_LIMIT_MS - elapsed)

    rateLimitTimeoutRef.current = setTimeout(() => {
      rateLimitTimeoutRef.current = null
      setQuestionIndex(0)
      setLevelIndex((index) => index + 1)
      setIsAdvancingLevel(false)
    }, waitMs)
  }

  const answerQuestion = (answer: string) => {
    if (!currentQuestion || selectedAnswer !== null || uiState !== 'ready') {
      return
    }

    const correct = answer === currentQuestion.correctAnswer
    setSelectedAnswer(answer)
    setIsCorrect(correct)

    const earned = correct
      ? pointsForCorrectAnswer(currentQuestion.difficulty)
      : 0
    const nextScore = score + earned
    if (earned > 0) {
      setScore(nextScore)
    }

    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null

      if (!isLastQuestionInLevel(questionIndex)) {
        setQuestionIndex((index) => index + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
        return
      }

      if (hasNextLevel(levelIndex)) {
        advanceToNextLevel()
        return
      }

      navigate('/result', {
        state: {
          score: nextScore,
          total: MAX_SCORE,
        } satisfies ResultLocationState,
      })
    }, ADVANCE_DELAY_MS)
  }

  const quit = () => {
    clearTimers()
    navigate('/')
  }

  const retry = async () => {
    clearTimers()
    setIsAdvancingLevel(false)
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    await refetch()
  }

  return {
    uiState,
    currentQuestion,
    currentLevelLabel,
    loadingLevelLabel,
    progressCurrent,
    progressTotal,
    score,
    selectedAnswer,
    isCorrect,
    errorMessage:
      error instanceof Error ? error.message : 'Something went wrong.',
    answerQuestion,
    quit,
    retry,
  }
}
