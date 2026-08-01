import type { Question } from '../../api/Question'
import type { TriviaQuestionDto } from '../dto/TriviaQuestionsResponseDto'
import { decodeHtml } from './decodeHtml'

let questionIdCounter = 0

export function mapQuestionFromDto(dto: TriviaQuestionDto): Question {
  const question = decodeHtml(dto.question)
  const correctAnswer = decodeHtml(dto.correct_answer)
  const incorrectAnswers = dto.incorrect_answers.map(decodeHtml)

  const answers =
    dto.type === 'boolean'
      ? (['True', 'False'] as string[])
      : shuffle([correctAnswer, ...incorrectAnswers])

  const correctAnswerIndex = answers.indexOf(correctAnswer)

  questionIdCounter += 1

  return {
    id: `q-${questionIdCounter}`,
    type: dto.type,
    difficulty: dto.difficulty,
    category: decodeHtml(dto.category),
    categoryId: null,
    question,
    correctAnswer,
    incorrectAnswers,
    answers,
    correctAnswerIndex,
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
