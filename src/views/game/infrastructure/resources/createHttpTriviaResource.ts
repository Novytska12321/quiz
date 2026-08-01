import type {
  FetchQuestionsParams,
  TriviaResource,
} from '../../api/TriviaResource'
import type { TriviaQuestionsResponseDto } from '../dto/TriviaQuestionsResponseDto'
import { mapQuestionFromDto } from '../mappers/mapQuestionFromDto'

const OPENTDB_BASE_URL = 'https://opentdb.com/api.php'

const RESPONSE_CODE_MESSAGES: Record<number, string> = {
  1: 'Not enough questions for this quiz.',
  2: 'Invalid quiz request.',
  3: 'Session token not found.',
  4: 'Question pool exhausted for this session.',
  5: 'Too many requests. Please wait a few seconds and try again.',
}

export function createHttpTriviaResource(): TriviaResource {
  return {
    async getQuestions({
      amount,
      type = 'boolean',
      signal,
    }: FetchQuestionsParams) {
      const url = new URL(OPENTDB_BASE_URL)
      url.searchParams.set('amount', String(amount))
      url.searchParams.set('type', type)

      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`Open Trivia DB request failed (${response.status})`)
      }

      const data = (await response.json()) as TriviaQuestionsResponseDto
      if (data.response_code !== 0) {
        throw new Error(
          RESPONSE_CODE_MESSAGES[data.response_code] ??
            `Open Trivia DB error (code ${data.response_code})`,
        )
      }

      return data.results.map(mapQuestionFromDto)
    },
  }
}
