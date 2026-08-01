import { useNavigate } from 'react-router'

export function HomeView() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-900 px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
        Quiz
      </h1>
      <p className="max-w-md text-lg text-slate-300">
        Five true or false questions. How many can you get right?
      </p>
      <button
        type="button"
        onClick={() => navigate('/game')}
        className="rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-sky-400"
      >
        Start Quiz
      </button>
    </div>
  )
}
