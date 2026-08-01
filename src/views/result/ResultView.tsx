import { Navigate, useLocation, useNavigate } from 'react-router'
import type { ResultLocationState } from '@/views/game'
import { getScoreMessage } from './domain/scoreMessage'

function isResultLocationState(value: unknown): value is ResultLocationState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Record<string, unknown>
  return typeof state.score === 'number' && typeof state.total === 'number'
}

export function ResultView() {
  const navigate = useNavigate()
  const location = useLocation()

  if (!isResultLocationState(location.state)) {
    return <Navigate to="/" replace />
  }

  const { score, total } = location.state
  const message = getScoreMessage(score, total)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-900 px-6 text-center text-white">
      <h1 className="text-4xl font-bold tracking-tight">Results</h1>
      <p className="text-6xl font-semibold tabular-nums text-sky-300">
        {score}/{total}
      </p>
      <p className="max-w-md text-lg text-slate-300">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/game')}
          className="rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
