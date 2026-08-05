import type { Difficulty } from '../api/Question'

export const QUESTIONS_PER_LEVEL = 5

export const LEVELS: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const

export const TOTAL_QUESTIONS = LEVELS.length * QUESTIONS_PER_LEVEL

export function levelLabel(difficulty: Difficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export function globalProgressCurrent(
  levelIndex: number,
  questionIndex: number,
): number {
  return levelIndex * QUESTIONS_PER_LEVEL + questionIndex + 1
}

export function hasNextLevel(levelIndex: number): boolean {
  return levelIndex < LEVELS.length - 1
}

export function isLastQuestionInLevel(questionIndex: number): boolean {
  return questionIndex >= QUESTIONS_PER_LEVEL - 1
}
