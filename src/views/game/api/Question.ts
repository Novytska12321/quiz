export type QuestionType = 'multiple' | 'boolean'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Question = {
  id: string
  type: QuestionType
  difficulty: Difficulty
  category: string
  categoryId: number | null
  question: string
  correctAnswer: string
  incorrectAnswers: string[]
  answers: string[]
  correctAnswerIndex: number
}
