---
last-updated: 2026-07-22
---

# Cursor Agent Guide

Source of truth for AI agents working in this repository.

This repo is a React 19 app built with Vite and TypeScript. It uses React Router for navigation, Tailwind CSS for styling, and npm as the package manager. The app is deployed to GitHub Pages with `base: '/quiz/'`.

Frontend code follows the **View module architecture** documented in `.cursor/docs/frontend/react-module-architecture.md` (enforced in `.cursor/rules/frontend/react-architecture.mdc` for `**/*.{tsx,jsx}`).

## Folder Structure

```text
.cursor/
├── AGENTS.md
├── docs/
│   ├── frontend/react-module-architecture.md
│   └── integrations/open-trivia-db.md
└── rules/frontend/react-architecture.mdc
public/
└── icons.svg
src/
├── app/                    # router, root providers, app shell
│   ├── App.tsx             # route definitions
│   └── providers.tsx       # root providers (QueryClient, etc.)
├── main.tsx                # React root mount
├── index.css               # Tailwind CSS entry
├── shared/                 # cross-View UI, hooks, utils, types
│   ├── components/
│   ├── hooks/
│   └── api/
└── views/                  # View modules (one folder per screen)
    ├── home/
    │   ├── index.ts        # public barrel
    │   └── HomeView.tsx
    └── game/
        ├── index.ts
        └── GameView.tsx
```

As Views grow, add layers inside each View folder per the architecture doc: `api/`, `hooks/`, `infrastructure/`, `context/`, `components/`, and optionally `domain/`.

## File Summaries

### `src/app/App.tsx`

Defines `BrowserRouter` with `basename={import.meta.env.BASE_URL}` and routes: `/` → `HomeView`, `/game` → `GameView`. Add new routes here; import Views from their public `index.ts` barrel (e.g. `@/views/home`).

### `src/app/providers.tsx`

Root provider composition. Mount app-wide providers here (e.g. TanStack Query `QueryClientProvider` when added).

### `src/views/`

One folder per View (vertical slice). Each View exports its public API through `index.ts`. Do not import another View's internal files — use its barrel or `shared/`.

### `src/shared/`

Code reused across multiple Views: UI primitives, hooks, utils, shared types.

### `src/index.css`

Imports Tailwind via `@import 'tailwindcss'`. Add global styles here only when they cannot live in component classes.

### `vite.config.ts`

Vite config with `@vitejs/plugin-react`, `@tailwindcss/vite`, and path alias `@` → `src/`. The `base` path (`/quiz/`) must stay in sync with the GitHub Pages deployment URL.

## Quick Routing

| Agent needs to...                | Go to                                      |
| -------------------------------- | ------------------------------------------ |
| Add or change a route            | `src/app/App.tsx`                          |
| Add root providers               | `src/app/providers.tsx`                    |
| Edit a page / View               | `src/views/<name>/`                        |
| Add cross-View shared code       | `src/shared/`                              |
| Change global styles or Tailwind | `src/index.css`                            |
| Adjust build or deploy base URL  | `vite.config.ts`                           |
| Check architecture conventions   | `.cursor/docs/frontend/react-module-architecture.md` |
| Open Trivia DB integration       | `.cursor/docs/integrations/open-trivia-db.md` |
| Check CI / GitHub Pages deploy   | `.github/workflows/deploy.yml`             |

## Core Rules

- Follow the View module architecture: dependency direction inward (UI → hooks → infrastructure → domain → api).
- Import Views via their `index.ts` barrel or from `shared/` — never deep-import another View's internals.
- Use the `@/` path alias for imports from `src/`.
- Keep React components and hooks pure. Side effects belong in event handlers, Effects, or external services, never in render.
- Use Tailwind utility classes for styling. Avoid inline styles and CSS modules unless there is a clear reason.
- Use `react-router` (`useNavigate`, `Link`, etc.) for navigation — do not manipulate `window.location` directly.
- Remember `basename` and `base: '/quiz/'` when adding routes or assets; use `import.meta.env.BASE_URL` for path prefixes.
- Run the narrowest useful command before finishing (`npm run lint`, then `npm run build` when a change touches routing or config).

## Common Commands

Run commands from the repository root.

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
```

## Staleness

All guidance files carry `last-updated`. If a file is older than about 3 months, verify it against the actual codebase and current library docs before following it blindly.
