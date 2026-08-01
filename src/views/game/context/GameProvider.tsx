import { useMemo, useState, type ReactNode } from 'react'
import type { TriviaResource } from '../api/TriviaResource'
import { createHttpTriviaResource } from '../infrastructure/resources/createHttpTriviaResource'
import { GameContext } from './GameContext'

type GameProviderProps = {
  children: ReactNode
  resource?: TriviaResource
}

export function GameProvider({ children, resource }: GameProviderProps) {
  const [defaultResource] = useState(() => createHttpTriviaResource())
  const resolvedResource = resource ?? defaultResource
  const value = useMemo(
    () => ({ resource: resolvedResource }),
    [resolvedResource],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
