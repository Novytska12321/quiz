import type { Difficulty } from '../api/Question'

export const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 1,
  medium: 4,
  hard: 7,
}

export const MAX_SCORE =
  POINTS_BY_DIFFICULTY.easy * 5 +
  POINTS_BY_DIFFICULTY.medium * 5 +
  POINTS_BY_DIFFICULTY.hard * 5

export function pointsForCorrectAnswer(difficulty: Difficulty): number {
  return POINTS_BY_DIFFICULTY[difficulty]
}
