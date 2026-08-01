import { createContext } from 'react'
import type { TriviaResource } from '../api/TriviaResource'

export type GameContextValue = {
  resource: TriviaResource
}

export const GameContext = createContext<GameContextValue | null>(null)
