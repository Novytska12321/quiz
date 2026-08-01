type GameFeedbackProps = {
  isCorrect: boolean
}

export function GameFeedback({ isCorrect }: GameFeedbackProps) {
  return (
    <p
      className={`mt-4 text-center text-lg font-medium ${
        isCorrect ? 'text-emerald-300' : 'text-rose-300'
      }`}
    >
      {isCorrect ? 'Correct!' : 'Incorrect'}
    </p>
  )
}
