import { AnswerButtons } from './components/AnswerButtons'
import { GameFeedback } from './components/GameFeedback'
import { GameProgress } from './components/GameProgress'
import { GameProvider } from './context/GameProvider'
import { useGameViewModel } from './hooks/useGameViewModel'

function GameScreen() {
  const {
    uiState,
    currentQuestion,
    progressCurrent,
    progressTotal,
    score,
    selectedAnswer,
    isCorrect,
    errorMessage,
    answerQuestion,
    quit,
    retry,
  } = useGameViewModel()

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-xl flex-1">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Quiz</h1>
          {uiState !== 'loading' && (
            <button
              type="button"
              onClick={quit}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
            >
              Quit
            </button>
          )}
        </header>

        {uiState === 'loading' && (
          <div className="flex min-h-64 items-center justify-center">
            <p className="text-lg text-slate-300">Loading questions…</p>
          </div>
        )}

        {uiState === 'error' && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg text-rose-300">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              Retry
            </button>
          </div>
        )}

        {(uiState === 'ready' || uiState === 'answered') && currentQuestion && (
          <>
            <GameProgress
              current={progressCurrent}
              total={progressTotal}
              score={score}
            />
            <p className="text-2xl leading-relaxed font-medium text-balance">
              {currentQuestion.question}
            </p>
            <AnswerButtons
              answers={currentQuestion.answers}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correctAnswer}
              disabled={uiState === 'answered'}
              onAnswer={answerQuestion}
            />
            {uiState === 'answered' && isCorrect !== null && (
              <GameFeedback isCorrect={isCorrect} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function GameView() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  )
}
