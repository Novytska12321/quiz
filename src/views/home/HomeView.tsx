import { useNavigate } from 'react-router'

export function HomeView() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <button
        type="button"
        onClick={() => navigate('/game')}
        className="rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-sky-400"
      >
        START
      </button>
    </div>
  )
}
