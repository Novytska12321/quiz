type GameProgressProps = {
  current: number
  total: number
  score: number
  levelLabel: string
}

export function GameProgress({
  current,
  total,
  score,
  levelLabel,
}: GameProgressProps) {
  return (
    <div className="mb-6 space-y-2 text-sm text-slate-300">
      <p className="text-base font-semibold tracking-wide text-sky-300">
        Level: {levelLabel}
      </p>
      <div className="flex items-center justify-between">
        <p>
          Question <span className="font-semibold text-white">{current}</span>/
          {total}
        </p>
        <p>
          Score <span className="font-semibold text-white">{score}</span>
        </p>
      </div>
    </div>
  )
}
