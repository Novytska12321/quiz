export const triviaQueryKeys = {
  all: ['trivia'] as const,
  questions: (amount: number, type: string, difficulty: string) =>
    [...triviaQueryKeys.all, 'questions', amount, type, difficulty] as const,
}
