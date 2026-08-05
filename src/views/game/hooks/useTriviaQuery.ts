import { useQuery } from '@tanstack/react-query'
import type { Difficulty } from '../api/Question'
import { QUESTIONS_PER_LEVEL } from '../domain/levels'
import { useGameContext } from '../context/useGameContext'
import { triviaQueryKeys } from './triviaQueryKeys'

const QUESTIONS_TYPE = 'boolean' as const

type UseTriviaQueryOptions = {
  difficulty: Difficulty
  enabled?: boolean
}

export function useTriviaQuery({
  difficulty,
  enabled = true,
}: UseTriviaQueryOptions) {
  const { resource } = useGameContext()

  return useQuery({
    queryKey: triviaQueryKeys.questions(
      QUESTIONS_PER_LEVEL,
      QUESTIONS_TYPE,
      difficulty,
    ),
    queryFn: ({ signal }) =>
      resource.getQuestions({
        amount: QUESTIONS_PER_LEVEL,
        type: QUESTIONS_TYPE,
        difficulty,
        signal,
      }),
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })
}
