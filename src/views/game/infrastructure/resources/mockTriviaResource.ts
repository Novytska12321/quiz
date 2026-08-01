import type { Question } from '../../api/Question'
import type { TriviaResource } from '../../api/TriviaResource'

const mockQuestions: Question[] = [
  {
    id: 'mock-1',
    type: 'boolean',
    difficulty: 'easy',
    category: 'General Knowledge',
    categoryId: null,
    question: 'The sky is blue.',
    correctAnswer: 'True',
    incorrectAnswers: ['False'],
    answers: ['True', 'False'],
    correctAnswerIndex: 0,
  },
  {
    id: 'mock-2',
    type: 'boolean',
    difficulty: 'easy',
    category: 'General Knowledge',
    categoryId: null,
    question: '2 + 2 equals 5.',
    correctAnswer: 'False',
    incorrectAnswers: ['True'],
    answers: ['True', 'False'],
    correctAnswerIndex: 1,
  },
  {
    id: 'mock-3',
    type: 'boolean',
    difficulty: 'medium',
    category: 'Science',
    categoryId: null,
    question: 'Water freezes at 0°C.',
    correctAnswer: 'True',
    incorrectAnswers: ['False'],
    answers: ['True', 'False'],
    correctAnswerIndex: 0,
  },
  {
    id: 'mock-4',
    type: 'boolean',
    difficulty: 'easy',
    category: 'Geography',
    categoryId: null,
    question: 'Paris is the capital of Germany.',
    correctAnswer: 'False',
    incorrectAnswers: ['True'],
    answers: ['True', 'False'],
    correctAnswerIndex: 1,
  },
  {
    id: 'mock-5',
    type: 'boolean',
    difficulty: 'easy',
    category: 'Animals',
    categoryId: null,
    question: 'Dogs are mammals.',
    correctAnswer: 'True',
    incorrectAnswers: ['False'],
    answers: ['True', 'False'],
    correctAnswerIndex: 0,
  },
]

export const mockTriviaResource: TriviaResource = {
  async getQuestions() {
    return mockQuestions
  },
}
