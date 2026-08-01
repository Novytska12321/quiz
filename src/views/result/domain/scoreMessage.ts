export function getScoreMessage(score: number, total: number): string {
  if (total <= 0) return 'Thanks for playing!'

  const ratio = score / total

  if (ratio >= 0.8) return 'Excellent work!'
  if (ratio >= 0.4) return 'Nice effort — keep going!'
  return 'Keep practicing — you will get there!'
}
