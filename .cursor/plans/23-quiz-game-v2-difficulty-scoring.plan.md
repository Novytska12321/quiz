---
last-updated: 2026-08-05
issue: 23
---

# Plan: #23 Quiz Game v2 — Progressive Difficulty & Weighted Scoring

## Type

feature

## Risk

medium — multi-level fetch orchestration, rate-limit handling between sequential Open Trivia DB calls, scoring domain rules, and retry semantics that must preserve prior levels; no automated tests in repo

## Source

- GitHub issue: [#23 Quiz Game v2 — Progressive Difficulty & Weighted Scoring](https://github.com/Novytska12321/quiz/issues/23)
- Requirements (same content): `.cursor/requirements/quiz-game-v2-difficulty-scoring.md`
- Integration guide: `.cursor/docs/integrations/open-trivia-db.md`
- Architecture: `.cursor/docs/frontend/react-module-architecture.md`
- Prior plan: `.cursor/plans/21-quiz-game-v1.plan.md`

## Summary

Upgrade the existing v1 quiz so a game runs **15** True/False questions across **three sequential levels** (5 easy → 5 medium → 5 hard), each via a separate Open Trivia DB request with `difficulty`. Award **weighted points** (1 / 4 / 7) for correct answers; show continuous progress `n/15`, a visible **current level** label, and Result as **`score/60`**. Promote Game to a clear Tier 3 module with domain scoring/level helpers; keep Home and routes unchanged; adjust Result score messaging to use the points maximum.

## Planning decisions (defaults)

| Topic                     | Decision                                                                                                                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate limit between levels | Proactive **≥5s delay** after a successful level fetch before starting the next level request (Open Trivia DB: 1 req/IP/5s). Keep existing Error + Retry for `response_code` `5` or network failure so the player can recover without losing prior score/levels. |
| Session tokens            | **Skip for v2** (still optional per AC). Three filtered fetches are short; tokens add token request/reset complexity. Revisit if duplicate questions become noticeable.                                                                                          |
| Scoring source            | Points from the **question’s** `difficulty` field via a Game domain helper (must match the requested level).                                                                                                                                                     |
| Max score / totals        | Domain constants in Game (e.g. `POINTS_BY_DIFFICULTY`, `MAX_SCORE = 60`, `QUESTIONS_PER_LEVEL = 5`, `LEVELS`). Pass `{ score, total: MAX_SCORE }` in `ResultLocationState` (shape unchanged; `total` meaning changes from question count → max points).          |
| Shared constants          | Keep scoring constants in Game `domain/`. Result continues to receive `total` via location state and uses ratio-based bands — no need to import Game domain into Result.                                                                                         |
| Level label copy          | Display **Easy** / **Medium** / **Hard** (capitalize difficulty). Visible in Ready, Answered, and preferably Loading (upcoming/current level).                                                                                                                   |
| Progress index            | Continuous across levels: `globalIndex + 1` over `15` (level 0 Q0 → `1/15`, level 1 Q0 → `6/15`, etc.).                                                                                                                                                          |
| Retry                     | Re-fetch **current level only**; do **not** reset score or completed earlier levels. Reset only question index within the current level and clear answered UI state. Full reset on Quit / Play Again / Start Quiz (new Game mount).                              |
| Result empty session      | Keep v1 behavior: redirect to `/`.                                                                                                                                                                                                                               |
| Score bands               | Keep `getScoreMessage(score, total)` ratio thresholds (0.8 / 0.4); with `total = 60` they become point-based automatically.                                                                                                                                      |
| Query strategy            | `useTriviaQuery(difficulty)` keyed by difficulty (and amount/type). View-model owns `levelIndex`; enable query for the active level; after last question of a non-final level, advance `levelIndex` (after delay window) so the next query runs.                 |

## Acceptance criteria (from issue)

- [ ] Full game loads 5 easy, then 5 medium, then 5 hard via **three** separate requests with matching `difficulty`
- [ ] After each of the first two levels (post 3s delay), next level fetches and play continues (no early Result)
- [ ] UI always shows current level (Easy / Medium / Hard) while playing
- [ ] Progress is continuous `n/15`
- [ ] Correct answers add 1 / 4 / 7 by difficulty; incorrect add 0
- [ ] Running score shows points; perfect game = 60
- [ ] Loading for initial and between-level fetches
- [ ] Level fetch failure / non-zero `response_code` → Error + Retry for **current level** without wiping earlier progress/score
- [ ] After 15 questions, Result shows `score/60`
- [ ] Result score message uses point-based bands against max 60
- [ ] Play Again / Start Quiz reset and start from easy level 1
- [ ] Quit, Go Home, Result empty-session behavior unchanged
- [ ] API only via `TriviaResource`; Game Tier 3 layering
- [ ] Rate-limit risk between sequential fetches handled

## Impacted areas

| Area                          | Impact                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `src/views/game/`             | Primary — port, query keys, view-model, domain, UI                  |
| `src/views/result/`           | Minor — bands already ratio-based; verify copy with max 60          |
| `src/views/home/`             | None                                                                |
| `src/app/App.tsx` / providers | None expected (routes and QueryClient already exist)                |
| `src/shared/`                 | None unless a second consumer needs scoring constants (not planned) |

## Local patterns to reuse

1. **Game Tier 2–3 slice** — `TriviaResource` → `createHttpTriviaResource` → `useTriviaQuery` → `useGameViewModel` → `GameView` + presentational components (`GameProgress`, `AnswerButtons`, `GameFeedback`).
2. **Result Tier 1** — `location.state` as `{ score, total }` + `getScoreMessage`; empty state → `<Navigate to="/" replace />`.

## Files to change / create

| Path                                                                  | Action                                                                                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/views/game/api/TriviaResource.ts`                                | Extend `FetchQuestionsParams` with optional `difficulty?: Difficulty`                                                                                                                      |
| `src/views/game/infrastructure/resources/createHttpTriviaResource.ts` | Pass `difficulty` query param when set                                                                                                                                                     |
| `src/views/game/infrastructure/resources/mockTriviaResource.ts`       | Return 5 questions filtered (or generated) by requested `difficulty`                                                                                                                       |
| `src/views/game/hooks/triviaQueryKeys.ts`                             | Include `difficulty` in query key                                                                                                                                                          |
| `src/views/game/hooks/useTriviaQuery.ts`                              | Accept difficulty; pass through to resource; keep AbortSignal via query `signal`                                                                                                           |
| `src/views/game/domain/scoring.ts` (new)                              | `POINTS_BY_DIFFICULTY`, `pointsForCorrectAnswer(difficulty)`, `MAX_SCORE`                                                                                                                  |
| `src/views/game/domain/levels.ts` (new)                               | Ordered levels (`easy` → `medium` → `hard`), `QUESTIONS_PER_LEVEL`, `TOTAL_QUESTIONS`, helpers for global progress / next level                                                            |
| `src/views/game/hooks/useGameViewModel.ts`                            | Multi-level state machine: level index, per-level question index, points score, between-level loading + rate-limit delay, navigate with `total: MAX_SCORE`, retry preserves prior progress |
| `src/views/game/components/GameProgress.tsx`                          | Add level label; keep `n/15` and points score                                                                                                                                              |
| `src/views/game/GameView.tsx`                                         | Wire level label into loading/ready/answered; loading copy may mention upcoming level                                                                                                      |
| `src/views/game/api/ResultLocationState.ts`                           | Keep shape; document that `total` is max points (60)                                                                                                                                       |
| `src/views/result/domain/scoreMessage.ts`                             | No logic change expected; spot-check bands against max 60                                                                                                                                  |
| `src/views/result/ResultView.tsx`                                     | No structural change expected (`score/total` already generic)                                                                                                                              |

## Ordered implementation steps

1. **Domain constants & helpers** — Add Game `domain/scoring.ts` and `domain/levels.ts` (point map, max score 60, level order, progress helpers). Pure functions only; no React.
2. **Extend Trivia port + HTTP** — Add `difficulty` to `FetchQuestionsParams`; set `url.searchParams` in `createHttpTriviaResource`. Update mock to honor difficulty (5 items per difficulty for local/dev).
3. **Query layer** — Update `triviaQueryKeys` and `useTriviaQuery(difficulty)` so each level is a distinct cache entry; keep `staleTime: 0` / `gcTime: 0` / `refetchOnMount: 'always'` semantics appropriate for quiz sessions (or `enabled` tied to active level).
4. **View-model multi-level flow** — Rewrite `useGameViewModel`:
   - State: `levelIndex` (0–2), `questionIndex` within level (0–4), `score` (points), answer feedback, advance timer.
   - On answer: add `pointsForCorrectAnswer(question.difficulty)` when correct.
   - After 3s: if more questions in level → next question; else if more levels → schedule next-level transition (respect ≥5s since last successful fetch), set loading, bump `levelIndex`, reset in-level index; else → navigate `/result` with `{ score, total: MAX_SCORE }`.
   - `retry`: refetch current level query only; clear answered UI / in-level index as needed; **do not** zero score or decrease `levelIndex`.
   - `quit`: clear timers, navigate `/`.
5. **UI** — Show level label (Easy/Medium/Hard) on GameProgress (and loading when practical); progress `n/15`; score as points. Keep AnswerButtons / GameFeedback / Quit / Error+Retry patterns.
6. **Result** — Confirm `score/60` and band messages; no route changes.
7. **Manual verification** — Walk the checklist below; run `npm run lint` and `npm run build`.

## Edge cases

| Case                                              | Expected behavior                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Rate limit (`response_code` 5) on level 2/3       | Error + Retry; prior levels’ points kept; Retry re-requests current difficulty only |
| Network / non-zero `response_code` on first level | Error + Retry; score stays 0                                                        |
| User Quits mid level 2                            | Navigate `/`; next Start Quiz starts level 1 fresh                                  |
| Play Again from Result                            | New Game mount → level 1 easy fetch; score 0                                        |
| Open `/result` with no state                      | Redirect `/`                                                                        |
| Last question of level 3 answered                 | After 3s → Result with final points / 60                                            |
| Between-level fetch while previous answers exist  | Loading UI; no answer controls; score unchanged until next answers                  |
| Abort on unmount / leave Game                     | Rely on TanStack Query `signal` + clear advance/rate-limit timers in cleanup        |
| Incorrect answer                                  | +0 points; still advance after 3s                                                   |

## Manual verification

1. Start Quiz → Loading → Easy label, `1/15`, score 0; answer through 5 easy questions; after last 3s delay → Loading (medium) → Medium, `6/15`, score preserved.
2. Finish medium → Loading (hard) → Hard, `11/15`; finish hard → Result `score/60` (perfect = `60/60`).
3. Confirm points: easy correct +1, medium +4, hard +7; wrong answers do not increase score.
4. Force failure (e.g. DevTools offline or mock throw) on level 2 → Error + Retry; score from easy remains; Retry loads medium again.
5. Quit mid-game → Home; Start Quiz resets from easy.
6. Play Again from Result → new easy fetch, score 0.
7. Open `/quiz/result` directly → redirect Home.
8. Observe network: three distinct `api.php` calls with `difficulty=easy|medium|hard`, `amount=5`, `type=boolean`; no immediate back-to-back fetch that ignores the 5s limit without handling.
9. `npm run lint` and `npm run build` succeed.

## Out of scope (per issue)

- Auth, category/difficulty picker, countdown timer, multiple choice, leaderboards, persistence, analytics, i18n, new routes, Home redesign, session tokens (deferred by planning decision)
