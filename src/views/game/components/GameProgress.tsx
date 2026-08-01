type GameProgressProps = {
  current: number
  total: number
  score: number
}

export function GameProgress({ current, total, score }: GameProgressProps) {
  return (
    <div className="mb-6 flex items-center justify-between text-sm text-slate-300">
      <p>
        Question <span className="font-semibold text-white">{current}</span>/
        {total}
      </p>
      <p>
        Score <span className="font-semibold text-white">{score}</span>
      </p>
    </div>
  )
}
