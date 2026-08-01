import type { Question } from './Question'

export type FetchQuestionsParams = {
  amount: number
  type?: 'multiple' | 'boolean'
  signal?: AbortSignal
}

export interface TriviaResource {
  getQuestions(params: FetchQuestionsParams): Promise<Question[]>
}
