# Quiz App

A trivia quiz built with React 19, TypeScript, Vite, React Router, and Tailwind CSS. Deployed to GitHub Pages at `/quiz/`.

## Development

```bash
npm install
npm run dev
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start dev server with HMR      |
| `npm run build`      | Type-check and production build |
| `npm run preview`    | Preview production build       |
| `npm run lint`       | Run ESLint                     |
| `npm run format`     | Format with Prettier           |
| `npm run format:check` | Check formatting             |

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
