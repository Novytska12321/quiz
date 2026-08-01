---
last-updated: 2026-08-01
issue: 21
---

# Plan: #21 Quiz Game v1

## Type

feature

## Risk

medium — new View module layers, external API, routing, and a new dependency (`@tanstack/react-query`); no automated tests in repo

## Source

- GitHub issue: [#21 Quiz Game v1](https://github.com/Novytska12321/quiz/issues/21)
- Requirements (same content): `.cursor/requirements/quiz-game-v1.md`
- Planning exercise: [#20](https://github.com/Novytska12321/quiz/issues/20)
- Integration guide: `.cursor/docs/integrations/open-trivia-db.md`
- Architecture: `.cursor/docs/frontend/react-module-architecture.md`

## Summary

Implement the end-to-end Quiz Game v1 flow: Home → Game (5 True/False questions from Open Trivia DB) → Result. Expand `src/views/game/` into a Tier 2–3 View module with a `TriviaResource` port, add a Tier 1 `ResultView`, wire `/result` in the router, and add TanStack Query at the app root. Keep UI simple with Tailwind; decode HTML entities before display; pass score via router location state.

## Planning decisions (defaults)

| Topic                  | Decision                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| Result with no session | Redirect to `/` (safer than empty state)                                                                  |
| Session tokens         | Skip for v1 (optional per AC); plain `amount=5&type=boolean` fetch                                        |
| Score bands            | Small domain helper in Result View (e.g. low / mid / high copy)                                           |
| HTML decode            | In Game infrastructure mapper; keep in View until a second consumer needs it                              |
| Answer labels          | Buttons labeled **True** / **False**; compare against decoded API `correct_answer` (`"True"` / `"False"`) |

## Acceptance criteria (from issue)

- [ ] Routes `/`, `/game`, and `/result` work under the app `basename` (`/quiz/` in production)
- [ ] Home shows the app title and **Start Quiz**; CTA navigates to `/game`
- [ ] Game fetches 5 boolean questions from Open Trivia DB on start / restart
- [ ] Loading state is visible while fetching
- [ ] Error state when request fails or `response_code` ≠ `0`, with working **Retry**
- [ ] One question at a time with progress `n/5` and running score
- [ ] True/False submit an answer; buttons disable after selection
- [ ] Correct/incorrect feedback; after 3s advance (or Result after last)
- [ ] Quit returns to Home
- [ ] Result shows final score (e.g. `3/5`) and optional score message
- [ ] Result **Play Again** → `/game` (new fetch); **Go Home** → `/`
- [ ] Opening Result without a completed session does not crash
- [ ] Question text readable (HTML entities decoded)
- [ ] API only via Game View `TriviaResource`; View module layering respected
- [ ] UI simple/clean with Tailwind

## Files to change / create

| Path                                                                  | Action                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `package.json` / lockfile                                             | add `@tanstack/react-query`                                        |
| `src/app/providers.tsx`                                               | mount `QueryClientProvider`                                        |
| `src/app/App.tsx`                                                     | add `/result` route; wrap Game route with `GameProvider` if needed |
| `src/views/home/HomeView.tsx`                                         | app title + **Start Quiz** CTA (replace current START-only screen) |
| `src/views/game/api/Question.ts`                                      | create — read model                                                |
| `src/views/game/api/TriviaResource.ts`                                | create — port interface                                            |
| `src/views/game/infrastructure/dto/`                                  | create — Open Trivia DB response DTO                               |
| `src/views/game/infrastructure/mappers/mapQuestionFromDto.ts`         | create — decode + map (shuffle optional for boolean)               |
| `src/views/game/infrastructure/resources/createHttpTriviaResource.ts` | create — `GET /api.php`, `AbortSignal`, `response_code` handling   |
| `src/views/game/infrastructure/resources/mockTriviaResource.ts`       | create — optional mock for local/dev                               |
| `src/views/game/hooks/triviaQueryKeys.ts`                             | create                                                             |
| `src/views/game/hooks/useTriviaQuery.ts`                              | create — TanStack Query for questions                              |
| `src/views/game/hooks/useGameViewModel.ts`                            | create — index, score, answered, 3s advance, navigate to result    |
| `src/views/game/context/GameProvider.tsx`                             | create — bind `TriviaResource`                                     |
| `src/views/game/domain/` (optional)                                   | create — e.g. score increment / advance helpers if non-trivial     |
| `src/views/game/components/`                                          | create — question, progress, answer buttons, loading/error UI      |
| `src/views/game/GameView.tsx`                                         | rewrite — wire view model + states                                 |
| `src/views/game/index.ts`                                             | export `GameView`, `GameProvider` as needed                        |
| `src/views/result/ResultView.tsx`                                     | create — score, message, Play Again / Go Home                      |
| `src/views/result/domain/scoreMessage.ts` (or similar)                | create — score-band copy                                           |
| `src/views/result/index.ts`                                           | create — public barrel                                             |
| `src/shared/`                                                         | no change unless a second View needs `decodeHtml`                  |

## Local patterns

- Existing Views: `src/views/home/` and `src/views/game/` — presentational stubs + `index.ts` barrels; extend Game into full Tier 2–3; keep Home Tier 0–1
- Router: `BrowserRouter` with `basename={import.meta.env.BASE_URL}` in `src/app/App.tsx`
- Integration layout: follow suggested tree in `.cursor/docs/integrations/open-trivia-db.md`
- Styling: Tailwind utility classes like current Home/Game slate/sky palette; no new design system
- Providers: empty `AppProviders` today — add QueryClient there per AGENTS.md

## Ordered steps

1. **Dependency & providers** — Install `@tanstack/react-query`. In `providers.tsx`, create a `QueryClient` and wrap children with `QueryClientProvider`.
2. **Game API + infrastructure** — Add `Question` read model and `TriviaResource` port. Implement DTO, `mapQuestionFromDto` (HTML-entity decode; stable `id`; for boolean, answers can stay `['True','False']` with `correctAnswerIndex`), `createHttpTriviaResource` calling `https://opentdb.com/api.php?amount=5&type=boolean` with `AbortSignal`. Throw / reject on network failure or `response_code` ≠ `0` (including rate limit `5`). Add a simple `mockTriviaResource` for wiring checks.
3. **Game composition** — `GameProvider` binds HTTP (or mock) resource. `triviaQueryKeys` + `useTriviaQuery` load questions via the port. Prefer `refetch` / query reset on Retry and on remount for Play Again.
4. **Game view model** — `useGameViewModel` owns: current index, score, selected answer / correctness, Answered timer (3s), Quit → `/`, Retry → refetch + reset local state, Complete → `navigate('/result', { state: { score, total: 5 } })`. Clear timer on unmount / Quit.
5. **Game UI** — Rewrite `GameView` for Loading / Ready / Answered / Error. Components: progress `n/5`, running score, question text, True/False (disabled after answer), feedback, Quit, Retry (error only). No Play Again on Game.
6. **Home** — Title + **Start Quiz** → `/game` (keep `useNavigate`).
7. **Result View** — New `src/views/result/` (Tier 1). Read `location.state`; if missing, `Navigate` to `/`. Show score, band message helper, **Play Again** → `/game`, **Go Home** → `/`.
8. **Routing** — Register `/result` in `App.tsx`; import via `@/views/result`. Wrap `/game` with `GameProvider` at the route (or inside `GameView`).
9. **Manual polish** — Lint; `npm run build` to verify basename/types. Spot-check HTML entities and 3s advance.

## Manual verification

- [ ] `npm run dev` — Home shows title + Start Quiz; navigates to `/game`
- [ ] Game shows loading, then first question with `1/5` and score `0`
- [ ] Answering disables buttons, shows correct/incorrect, advances after ~3s
- [ ] After Q5 feedback, lands on `/result` with correct `score/5` and a band message
- [ ] Play Again fetches a new set; Go Home returns to `/`
- [ ] Quit mid-quiz returns to Home without crashing
- [ ] Simulate API failure (e.g. offline / mock error): Error + Retry recovers
- [ ] Open `/result` directly (no state): redirects to `/`
- [ ] Under production base: paths work with `/quiz/` basename (`npm run build` + `preview`)
- [ ] Question text with entities (e.g. `&quot;`) displays decoded
- [ ] No `fetch` inside View/presentational components; resource used only via port/hooks

## Edge cases

- Open Trivia DB `response_code` 1–5 → Error + Retry (especially rate limit `5`)
- User Quit or navigates away during 3s delay → clear timeout; no late navigate to Result
- Rapid Retry / remount → cancel in-flight fetch via `AbortSignal` / Query cancel
- Play Again while previous query cached → ensure a fresh round (refetch on mount or invalidate)
- Result refresh / deep link without state → redirect home, no crash
- Boolean answers from API may be HTML-encoded; decode before compare/display
- Exactly one answer per question; ignore further clicks while Answered

## Out of scope

- Auth, categories, difficulty, multiple choice, countdown timer per question
- Leaderboards / persistence / analytics / i18n
- Session-token flow (optional later)
- Editing `.cursor/requirements/quiz-game-v1.md`
- Automated test suite (repo has none yet)
