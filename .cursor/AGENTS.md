---
last-updated: 2026-07-22
---

# Cursor Agent Guide

Source of truth for AI agents working in this repository.

This repo is a single-page React 19 app built with Vite and TypeScript. It uses React Router for navigation, Tailwind CSS for styling, and npm as the package manager. The app is deployed to GitHub Pages with `base: '/quiz/'`.

## Folder Structure

```text
.cursor/
└── AGENTS.md
public/
└── icons.svg
src/
├── App.tsx          # Router setup and route definitions
├── index.css        # Tailwind CSS entry
├── main.tsx         # React root mount
└── views/
    ├── Home.tsx     # Landing page with START button
    └── Game.tsx     # Quiz game view (work in progress)
```

## File Summaries

### `src/App.tsx`

Defines `BrowserRouter` with `basename={import.meta.env.BASE_URL}` and routes: `/` → `Home`, `/game` → `Game`. Add new routes here.

### `src/views/`

Page-level components. One file per view; keep shared UI in new `src/components/` as the app grows.

### `src/index.css`

Imports Tailwind via `@import 'tailwindcss'`. Add global styles here only when they cannot live in component classes.

### `vite.config.ts`

Vite config with `@vitejs/plugin-react` and `@tailwindcss/vite`. The `base` path (`/quiz/`) must stay in sync with the GitHub Pages deployment URL.

## Quick Routing

| Agent needs to...              | Go to                          |
| ------------------------------ | ------------------------------ |
| Add or change a route          | `src/App.tsx`                  |
| Edit a page / view             | `src/views/`                   |
| Change global styles or Tailwind | `src/index.css`              |
| Adjust build or deploy base URL | `vite.config.ts`              |
| Check CI / GitHub Pages deploy | `.github/workflows/deploy.yml` |

## Core Rules

- Prefer the existing Vite and React patterns in this repo over introducing new structure.
- Keep React components and hooks pure. Side effects belong in event handlers, Effects, or external services, never in render.
- Keep functions and components focused. Extract repeated multi-step logic into named helpers once it appears twice or makes a component hard to scan.
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
