export const triviaQueryKeys = {
  all: ['trivia'] as const,
  questions: (amount: number, type: string) =>
    [...triviaQueryKeys.all, 'questions', amount, type] as const,
}
