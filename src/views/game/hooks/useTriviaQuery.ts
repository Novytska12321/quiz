import { useQuery } from '@tanstack/react-query'
import { useGameContext } from '../context/useGameContext'
import { triviaQueryKeys } from './triviaQueryKeys'

const QUESTIONS_AMOUNT = 5
const QUESTIONS_TYPE = 'boolean' as const

export function useTriviaQuery() {
  const { resource } = useGameContext()

  return useQuery({
    queryKey: triviaQueryKeys.questions(QUESTIONS_AMOUNT, QUESTIONS_TYPE),
    queryFn: ({ signal }) =>
      resource.getQuestions({
        amount: QUESTIONS_AMOUNT,
        type: QUESTIONS_TYPE,
        signal,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })
}
