import type { Difficulty, Question } from '../../api/Question'
import type {
  FetchQuestionsParams,
  TriviaResource,
} from '../../api/TriviaResource'

function createMockQuestion(
  difficulty: Difficulty,
  index: number,
  question: string,
  correctAnswer: 'True' | 'False',
): Question {
  const incorrectAnswers = [correctAnswer === 'True' ? 'False' : 'True']
  const answers = ['True', 'False']
  return {
    id: `mock-${difficulty}-${index}`,
    type: 'boolean',
    difficulty,
    category: 'General Knowledge',
    categoryId: null,
    question,
    correctAnswer,
    incorrectAnswers,
    answers,
    correctAnswerIndex: answers.indexOf(correctAnswer),
  }
}

const mockByDifficulty: Record<Difficulty, Question[]> = {
  easy: [
    createMockQuestion('easy', 1, 'The sky is blue.', 'True'),
    createMockQuestion('easy', 2, '2 + 2 equals 5.', 'False'),
    createMockQuestion('easy', 3, 'Water freezes at 0°C.', 'True'),
    createMockQuestion('easy', 4, 'Paris is the capital of Germany.', 'False'),
    createMockQuestion('easy', 5, 'Dogs are mammals.', 'True'),
  ],
  medium: [
    createMockQuestion(
      'medium',
      1,
      'Sound travels faster than light.',
      'False',
    ),
    createMockQuestion(
      'medium',
      2,
      'The chemical symbol for gold is Au.',
      'True',
    ),
    createMockQuestion('medium', 3, 'Mount Everest is in Europe.', 'False'),
    createMockQuestion('medium', 4, 'A hexagon has six sides.', 'True'),
    createMockQuestion('medium', 5, 'Sharks are mammals.', 'False'),
  ],
  hard: [
    createMockQuestion(
      'hard',
      1,
      'Neutron stars can rotate hundreds of times per second.',
      'True',
    ),
    createMockQuestion(
      'hard',
      2,
      'The speed of light in vacuum is exactly 300,000 km/s.',
      'False',
    ),
    createMockQuestion('hard', 3, 'RNA uses thymine as a base.', 'False'),
    createMockQuestion(
      'hard',
      4,
      'Euler’s identity involves e, i, and π.',
      'True',
    ),
    createMockQuestion(
      'hard',
      5,
      'Pluto is classified as a planet by the IAU.',
      'False',
    ),
  ],
}

export const mockTriviaResource: TriviaResource = {
  async getQuestions({ amount, difficulty }: FetchQuestionsParams) {
    const pool = difficulty
      ? mockByDifficulty[difficulty]
      : mockByDifficulty.easy
    return pool.slice(0, amount)
  },
}
