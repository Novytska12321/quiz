# Quiz App

A trivia quiz built with React 19, TypeScript, Vite, React Router, and Tailwind CSS. Deployed to GitHub Pages at `/quiz/`.

Features in this repo are built using **SDD (Specification-Driven Development)** — a **spec-first workflow** where durable documents are created before code, with AI assistance at each stage. The pipeline in short: **requirements → ticket → plan → implementation**.

## SDD (Specification-Driven Development)

**SDD** is the methodology used in this project. It is not as widely known as TDD or BDD, so here it means:

> Start from a rough idea, produce a requirements document, then an implementation plan, and only then write code — with human approval between stages.

**requirements → ticket → plan → implementation**

In practice, this is a **spec-first workflow**: requirements and plans are the source of truth; implementation follows them.

### Workflow

| Stage             | Input                      | Output                                               | Cursor Skill                                          |
| ----------------- | -------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| 1. Requirements   | Rough draft (any language) | `.cursor/requirements/<slug>.md` (English)           | `draft-to-requirement`                                |
| 2. Ticket         | Approved requirements      | GitHub issue (same content as the requirements file) | `draft-to-requirement` (optional step after approval) |
| 3. Plan           | GitHub issue               | `.cursor/plans/<issue-number>-<slug>.plan.md`        | `ticket-to-plan`                                      |
| 4. Implementation | Approved plan              | Working code in `src/`                               | _(follow the plan in a follow-up session)_            |

Each stage ends with a **review and approval** before moving on. The AI agent reads project context (architecture docs, integrations, rules) so artifacts fit this codebase — not generic web-app advice.

### Example: Quiz Game v1

```text
draft-to-requirement          →  .cursor/requirements/quiz-game-v1.md
  → GitHub issue              →  implementation ticket
ticket-to-plan #<issue>       →  .cursor/plans/<issue>-quiz-game-v1.plan.md
  → execute approved plan     →  src/views/game/
```

Skills live under `.cursor/skills/`. See `.cursor/AGENTS.md` for repo conventions and architecture references.

## Development

```bash
npm install
npm run dev
```

## Scripts

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start dev server with HMR       |
| `npm run build`        | Type-check and production build |
| `npm run preview`      | Preview production build        |
| `npm run lint`         | Run ESLint                      |
| `npm run format`       | Format with Prettier            |
| `npm run format:check` | Check formatting                |

## Project Structure

Frontend code follows the **View module architecture** (see `.cursor/docs/frontend/react-module-architecture.md`):

```text
src/
├── app/          # router, root providers
├── shared/       # cross-View components, hooks, utils
└── views/        # one folder per screen (vertical slice)
    ├── home/
    └── game/
```

Each View is a self-contained module. As features grow, add layers inside a View folder: `api/`, `hooks/`, `infrastructure/`, `context/`, `components/`, and optionally `domain/`.

Imports use the `@/` alias (`@` → `src/`).

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`. The Vite `base` path (`/quiz/`) must match the GitHub Pages URL.
