---
last-updated: 2026-08-04
---

# Quiz Game v2 — Progressive Difficulty & Weighted Scoring

## Overview

Upgrade the existing quiz game (v1) so a game progresses through three difficulty levels fetched from Open Trivia DB, and correct answers award points by difficulty. The player still starts from Home, answers True/False questions on Game, then sees a final score on Result.

**Scope of this version:** progressive difficulty levels (easy → medium → hard), a visible current-level indicator, and weighted scoring. Other v1 behavior (routes, True/False, 3s auto-advance, Quit / Play Again / Go Home) remains unless noted below.

Stack: React 19, Vite, TypeScript, React Router, Tailwind. Deployed under `base: '/quiz/'`.

## Functional requirements

### Level structure

| Level | Difficulty | Questions | When fetched                                                                        |
| ----- | ---------- | --------- | ----------------------------------------------------------------------------------- |
| 1     | `easy`     | 5         | On Game enter / restart (same as today for the first fetch)                         |
| 2     | `medium`   | 5         | After the player finishes level 1 (last easy question’s feedback delay completes)   |
| 3     | `hard`     | 5         | After the player finishes level 2 (last medium question’s feedback delay completes) |

- **Total questions per game:** 15.
- Each level is a **separate** Open Trivia DB request with `amount=5`, `type=boolean`, and the corresponding `difficulty`.
- Do not fetch all difficulties in one request. Levels must load sequentially as above.
- After level 3’s last question feedback delay, navigate to `/result` with the final score.

### Scoring

| Difficulty | Points for a correct answer | Points for an incorrect answer |
| ---------- | --------------------------- | ------------------------------ |
| Easy       | 1                           | 0                              |
| Medium     | 4                           | 0                              |
| Hard       | 7                           | 0                              |

- **Maximum score for a perfect game:** `5×1 + 5×4 + 5×7` = **60**.
- Running score on Game starts at `0` each new quiz and increases only on correct answers by the current question’s difficulty points.
- Exactly one answer per question; no changing the answer after selection.

### Routes (unchanged paths)

| Path      | View         | Purpose                                      |
| --------- | ------------ | -------------------------------------------- |
| `/`       | `HomeView`   | App title + start CTA                        |
| `/game`   | `GameView`   | Progressive quiz with weighted score         |
| `/result` | `ResultView` | Final score as points / maximum (`score/60`) |

### Home (`/`)

Unchanged from v1: title + **Start Quiz** → `/game`.

### Game (`/game`)

- On enter (and on each restart / Play Again), fetch level 1: **5 easy** boolean questions.
- Show **one question at a time**.
- Show the **current level** clearly at all times while playing (Ready / Answered), using a readable label such as **Easy**, **Medium**, or **Hard** (exact copy is implementation detail; must map to the active level’s difficulty). The player must always know which level they are on without inferring it only from progress index.
- Show progress over the full game: current index over **15** (e.g. `6/15` when the first medium question is shown). Index is continuous across levels (easy = 1–5, medium = 6–10, hard = 11–15).
- Show running **points** score (not “number of correct answers”).
- True / False answer buttons; after selection: feedback, disable buttons, auto-advance after **3 seconds** (same as v1).
- When the last question of a level is done (after the 3s delay):
  - If another level remains → enter **Loading** for the next batch fetch, then continue with the next question when ready. Prefer indicating which level is loading (e.g. medium / hard) when practical.
  - If level 3 is done → navigate to `/result` with final score and maximum (`60`).
- **Quit** → `/` without requiring a completed quiz.
- **Retry** appears in the Error state and re-fetches the **current level’s** questions (same difficulty / amount). Do not discard already-earned points or completed earlier levels unless the whole game is restarted (Quit / Play Again / Start Quiz).

### Result (`/result`)

- Show final score with maximum: e.g. `42/60` (points earned / max possible for the game).
- Optionally show a short message based on score bands relative to the **point maximum** (60), not “correct count / 15”. Bands live in one domain helper (existing Result pattern).
- **Play Again** → `/game` and starts a new game (level 1 fetch again; score reset).
- **Go Home** → `/`.
- Opening `/result` without a completed session: redirect to `/` or safe empty state — do not crash.

### Game states (Game View)

| State    | When                                                            | UI / behavior                                                                      |
| -------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Loading  | Any level request in flight (initial or between levels)         | Loading indicator; no answer controls; prefer showing upcoming/current level       |
| Ready    | Current level loaded; awaiting / mid-quiz                       | **Current level label**, question, progress `n/15`, points score, True/False, Quit |
| Answered | User just selected an answer                                    | Feedback; buttons disabled; auto-advance in 3s; **current level still visible**    |
| Error    | Current level request failed or non-success API `response_code` | Error message + **Retry** (retry current level only)                               |
| Complete | All 15 answered and last feedback delay done                    | Navigate to `/result`                                                              |

## UI / layout

- Keep UI simple/clean; Tailwind; align with Figma when available.
- Game: **current level label** (Easy / Medium / Hard), progress `n/15`, running **points**, question, True/False, Quit; loading between levels as well as on first load.
- Result: **`score/60`** (or `score/{maxScore}` if max is passed as data), optional band message, Play Again + Go Home.
- Decode HTML entities before display.

## Data / integrations

- **API:** Open Trivia DB — see `.cursor/docs/integrations/open-trivia-db.md`.
- **Requests per game (success path):**

  | Level  | Example query                                             |
  | ------ | --------------------------------------------------------- |
  | Easy   | `GET .../api.php?amount=5&type=boolean&difficulty=easy`   |
  | Medium | `GET .../api.php?amount=5&type=boolean&difficulty=medium` |
  | Hard   | `GET .../api.php?amount=5&type=boolean&difficulty=hard`   |

- Access only through the Game View `TriviaResource` port. Extend the port/query params so `difficulty` is supported (v1 had no difficulty filter).
- Validate `response_code`; non-zero → Error for the current level.
- Prefer `AbortSignal` when leaving the screen or starting a new game.
- **Rate limit:** Open Trivia DB allows at most **1 request per IP every 5 seconds**. Between levels, account for this (e.g. delay/backoff or surface a clear Error/Retry if `response_code` is `5`). Do not fire level 2/3 immediately in a way that ignores this constraint without handling failures.
- Session tokens remain optional but recommended for multi-fetch games to reduce duplicates.
- Pass to Result via router location state (or equivalent View-scoped session): at least `{ score, total }` where `total` is the max points (**60**), not question count. Prefer not to put score in the URL.

## Rules & constraints

### Scoring and timing

- Points awarded only for correct answers, by difficulty (see table above).
- Auto-advance delay: **3 seconds** after answer feedback.
- Total questions per game: **15**; max points: **60**.
- Difficulty for scoring must come from the question’s difficulty (API field), matching the requested level.

### Architecture

Follow View module architecture (`.cursor/docs/frontend/react-module-architecture.md`):

| Module              | Suggested tier | Notes                                                             |
| ------------------- | -------------- | ----------------------------------------------------------------- |
| `src/views/home/`   | Tier 0–1       | Unchanged                                                         |
| `src/views/game/`   | Tier 3         | Multi-level fetch flow + domain scoring rules                     |
| `src/views/result/` | Tier 1         | Consume points/`total` max; update score-message bands for max 60 |

- Domain helpers for point values and max score belong in Game (and/or shared only if Result also needs the constants without duplicating magic numbers).
- Prefer TanStack Query (or equivalent hook orchestration) for each level fetch; view-model owns level index, question index within the game, selected answer, points, and transitions between levels.
- Dependency direction: UI → hooks/context → infrastructure → domain → api.
- Use `react-router`; respect `basename` / `BASE_URL`.

## Out of scope

- Authentication / user accounts
- Player-chosen category or difficulty (difficulty is fixed by level, not user-selected)
- Per-question countdown timer (only the 3s auto-advance)
- Multiple-choice questions
- Leaderboards, high-score persistence, analytics
- Showing correct-answer count separately from points on Result
- Localization
- Changing Home layout or adding new routes beyond existing `/`, `/game`, `/result`

## Acceptance criteria

- [ ] A full game loads **5 easy**, then **5 medium**, then **5 hard** boolean questions via **three** separate Open Trivia DB requests with the matching `difficulty`.
- [ ] After finishing each of the first two levels (post 3s delay), the next level is fetched and the game continues without going to Result early.
- [ ] While playing, the UI always shows the **current level** as Easy, Medium, or Hard (or equivalent clear labels).
- [ ] Progress shows continuous `n/15` across all levels.
- [ ] Correct easy / medium / hard answers add **1 / 4 / 7** points respectively; incorrect answers add **0**.
- [ ] Running score on Game shows points; a perfect game yields **60**.
- [ ] Loading is shown for the initial fetch and for between-level fetches.
- [ ] Level fetch failure (or non-zero `response_code`, including rate limit) shows Error + **Retry** for the current level without wiping earlier progress/score unless the user restarts the game.
- [ ] After 15 questions, Result shows final score as **`score/60`** (points / maximum).
- [ ] Result optional score message uses point-based bands against max 60.
- [ ] Play Again / Start Quiz reset score and start again from easy level 1.
- [ ] Quit, Go Home, and Result empty-session behavior from v1 still hold.
- [ ] API access remains through `TriviaResource`; Game follows View module layering (Tier 3 appropriate for multi-level + scoring rules).
- [ ] Rate-limit risk between sequential fetches is handled (delay and/or clear Error/Retry).
