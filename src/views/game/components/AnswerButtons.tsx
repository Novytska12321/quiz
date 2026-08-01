type AnswerButtonsProps = {
  answers: string[]
  selectedAnswer: string | null
  correctAnswer: string
  disabled: boolean
  onAnswer: (answer: string) => void
}

export function AnswerButtons({
  answers,
  selectedAnswer,
  correctAnswer,
  disabled,
  onAnswer,
}: AnswerButtonsProps) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {answers.map((answer) => {
        const isSelected = selectedAnswer === answer
        const showResult = selectedAnswer !== null
        const isCorrectOption = answer === correctAnswer

        let tone = 'border-slate-600 bg-slate-800 hover:border-sky-400 hover:bg-slate-700'
        if (showResult && isCorrectOption) {
          tone = 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
        } else if (showResult && isSelected && !isCorrectOption) {
          tone = 'border-rose-400 bg-rose-500/20 text-rose-100'
        }

        return (
          <button
            key={answer}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(answer)}
            className={`rounded-lg border px-6 py-3 text-lg font-semibold transition disabled:cursor-not-allowed ${tone}`}
          >
            {answer}
          </button>
        )
      })}
    </div>
  )
}
