---
last-updated: 2026-07-30
---

# Quiz Game v1 — Requirements

## Overview

Build a basic quiz game (v1) so players can start from Home, answer five True/False questions from Open Trivia DB on the Game screen, then see their final score on a Result screen. The goal is to practice View-module architecture, API integration, routing, and a clean UI flow — not a full product.

Stack: React 19, Vite, TypeScript, React Router, Tailwind. Deployed under `base: '/quiz/'` (routes use `BrowserRouter` with `basename={import.meta.env.BASE_URL}`).

## Functional requirements

### Routes

| Path       | View          | Purpose                                      |
| ---------- | ------------- | -------------------------------------------- |
| `/`        | `HomeView`    | App title + start CTA                        |
| `/game`    | `GameView`    | Fetch and play the quiz                      |
| `/result`  | `ResultView`  | Show final score and next actions            |

Add `/result` in `src/app/App.tsx`. Import Views only via their public `index.ts` barrels.

### Home (`/`)

- Show the app title and a **Start Quiz** button.
- Clicking **Start Quiz** navigates to `/game`.

### Game (`/game`)

- On enter (and on each restart), fetch **5** True/False questions from Open Trivia DB (`amount=5`, `type=boolean`). No category or difficulty filters in v1.
- Show **one question at a time**.
- Show progress as current index over total (e.g. `2/5`).
- Show running score (number of correct answers so far).
- Provide two answer buttons labeled **True** and **False** (map to Open Trivia DB boolean answers).
- After the player selects an answer:
  - Mark whether the answer was correct or incorrect.
  - Disable both answer buttons until the next question (or until navigation away).
  - After **3 seconds**, advance to the next question automatically.
- After the last question’s feedback delay, navigate to `/result` with the final score.
- **Quit** navigates to `/` without requiring a completed quiz.
- **Retry** appears only in the error state and re-fetches questions.
- **Play Again** (when shown on this screen, if used) restarts the quiz with a new fetch; primary Play Again lives on Result.

### Result (`/result`)

- Show final score (e.g. `3/5`).
- Optionally show a short message based on score bands (e.g. low / mid / high). Exact copy is implementation detail; bands should be defined in one place (prefer a small domain helper in the Result or shared game domain).
- **Play Again** navigates to `/game` and starts a new quiz (new API fetch).
- **Go Home** navigates to `/`.
- If the user opens `/result` without a completed session (no score), redirect to `/` or show a safe empty state with a link home — do not crash.

### Game states (Game View)

| State      | When                                      | UI / behavior                                      |
| ---------- | ----------------------------------------- | -------------------------------------------------- |
| Loading    | Questions request in flight               | Loading indicator; no answer controls              |
| Ready      | Questions loaded; awaiting / mid-quiz     | Question, progress, score, True/False, Quit        |
| Answered   | User just selected an answer              | Feedback; buttons disabled; auto-advance in 3s     |
| Error      | Request failed or non-success API code    | Error message + **Retry**                          |
| Complete   | All 5 answered and feedback delay done    | Navigate to `/result` (Result is the end screen)   |

## UI / layout

- Keep UI simple and clean; align with the project’s Figma design when available. Until then, use clear Tailwind layout without inventing a new design system.
- Home: title + primary CTA only (first viewport stays uncluttered).
- Game: progress, score, question text, True/False controls, Quit; loading and error variants as above.
- Result: score, optional message, Play Again + Go Home.
- Decode HTML entities in question/answer text before display (Open Trivia DB default encoding).

## Data / integrations

- **API:** Open Trivia DB — see `.cursor/docs/integrations/open-trivia-db.md`.
- **Request:** `GET https://opentdb.com/api.php?amount=5&type=boolean` (optional `encode` if preferred over client-side HTML decode).
- Access the API only through the Game View resource port (`TriviaResource` in `src/views/game/api/`). No `fetch` in View/UI components.
- Validate `response_code`; treat non-zero codes as error (including rate limit `5`). Map to the Error state with Retry.
- Prefer `AbortSignal` for in-flight requests when leaving the screen or starting a new game.
- Session tokens are recommended for Play Again to reduce duplicates, but are **not required** for v1 acceptance if rate limit and success path work with a plain fetch.
- Pass final score (and total, e.g. `5`) to Result via router location state or equivalent View-scoped session — not `window` globals. Prefer not to deep-link score in the URL unless product later requires shareable results.

## Rules & constraints

### Scoring and timing

- Score = count of correct answers; starts at `0` each new quiz.
- Exactly one answer per question; no changing the answer after selection.
- Auto-advance delay: **3 seconds** after answer feedback appears.
- Total questions per round: **5**.

### Architecture

Follow View module architecture (`.cursor/docs/frontend/react-module-architecture.md`):

| Module                         | Suggested tier | Notes                                                                 |
| ------------------------------ | -------------- | --------------------------------------------------------------------- |
| `src/views/home/`              | Tier 0–1       | Presentational + navigate                                             |
| `src/views/game/`              | Tier 2–3       | Trivia resource, query hook, view model; domain for score/advance if needed |
| `src/views/result/`            | Tier 1         | Props/location state + actions; optional score-message helper         |

- Dependency direction: UI → hooks/context → infrastructure → domain → api.
- Prefer TanStack Query for the questions fetch; UI state (current index, selected answer, score, feedback) in a Game view-model hook.
- Extract shared helpers (e.g. `decodeHtml`) to `src/shared/` only when a second View needs them.
- Use `react-router` for navigation; respect `basename` / `BASE_URL`.

## Out of scope

- Authentication / user accounts
- Category or difficulty selection
- Per-question countdown timer (only the 3s auto-advance after answer)
- Multiple-choice questions
- Leaderboards, persistence of high scores, or analytics
- Session-token UX beyond what is needed for a reliable fetch (optional for v1)
- Localization

## Acceptance criteria

- [ ] Routes `/`, `/game`, and `/result` work under the app `basename` (`/quiz/` in production).
- [ ] Home shows the app title and **Start Quiz**; CTA navigates to `/game`.
- [ ] Game fetches 5 boolean questions from Open Trivia DB on start / restart.
- [ ] Loading state is visible while fetching.
- [ ] Error state is shown when the request fails or `response_code` ≠ `0`, with a working **Retry**.
- [ ] One question is shown at a time with progress `n/5` and running score.
- [ ] True and False buttons submit an answer; buttons disable after selection.
- [ ] Correct/incorrect feedback is shown; after 3 seconds the next question appears (or Result after the last).
- [ ] Quit returns to Home.
- [ ] After all five questions, Result shows final score (e.g. `3/5`) and optional score message.
- [ ] Result **Play Again** starts a new quiz on `/game`; **Go Home** goes to `/`.
- [ ] Opening Result without a completed session does not crash (redirect or safe empty state).
- [ ] Question text is readable (HTML entities decoded).
- [ ] Game API access goes through the Game View resource port; Views follow the module layering rules.
- [ ] UI remains simple/clean and uses Tailwind consistent with the project.
