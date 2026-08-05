import type { Difficulty, Question } from './Question'

export type FetchQuestionsParams = {
  amount: number
  type?: 'multiple' | 'boolean'
  difficulty?: Difficulty
  signal?: AbortSignal
}

export interface TriviaResource {
  getQuestions(params: FetchQuestionsParams): Promise<Question[]>
}
