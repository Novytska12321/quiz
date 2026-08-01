export type TriviaQuestionDto = {
  type: 'multiple' | 'boolean'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

export type TriviaQuestionsResponseDto = {
  response_code: number
  results: TriviaQuestionDto[]
}
