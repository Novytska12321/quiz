---
name: ticket-plan
description: >-
  Fetches a GitHub issue via MCP, drafts an implementation plan, and executes it
  in this Vite + React + TypeScript repo. Use when the user invokes ticket-plan,
  provides a GitHub issue number or URL, or asks to implement a GitHub issue.
---

Given an issue reference (e.g. `#123` or a GitHub URL), retrieve it with GitHub MCP and deliver implementation end-to-end.

## Inputs

- Issue number or URL, e.g. `ticket-plan #123`

## Prerequisites

- GitHub MCP (`user-github`) configured and authenticated
- Access to the current repository

## Steps

### 1. Read project context

Before scoping work, read:

- `.cursor/AGENTS.md` — repo conventions, folder layout, commands
- `.cursor/docs/frontend/react-module-architecture.md` — View module layering and naming
- `.cursor/docs/integrations/` — integration docs relevant to the issue (e.g. `open-trivia-db.md`)

### 2. Fetch issue context

Resolve `owner` and `repo` from `git remote get-url origin` (currently `Novytska12321/quiz`).

Use GitHub MCP (`user-github`):

| Tool | Method | Purpose |
|------|--------|---------|
| `issue_read` | `get` | title, body, labels, assignees, state |
| `issue_read` | `get_comments` | discussion context (paginate if needed) |
| `issue_read` | `get_labels` | label details when needed |

If MCP is unavailable, stop and ask the user to paste issue content.

### 3. Clarify acceptance criteria

Extract explicit and implicit AC from the issue text.
If ambiguous, ask 1–3 concrete questions before coding.

### 4. Scope analysis

Identify impacted areas:

- View modules (`src/views/<name>/`) — follow `.cursor/docs/frontend/react-module-architecture.md`
- routing (`src/app/App.tsx`) — remember `basename` and `base: '/quiz/'`
- root providers (`src/app/providers.tsx`)
- shared code (`src/shared/`)
- global styles (`src/index.css`)
- build / deploy (`vite.config.ts`, `.github/workflows/deploy.yml`)
- typings (`tsconfig*.json`)

This repo has no test runner yet — do not assume Vitest or RTL exist.

### 5. Find local patterns

Locate 1–2 similar existing implementations and reuse their conventions.

### 6. Produce implementation plan

Save the plan to `.cursor/plans/<issue-number>-<slug>.plan.md` (per `.cursor/rules/plans.mdc`).

Include:

- Type: feature / bugfix / refactor
- Risk: low / medium / high
- Files to change
- Ordered implementation steps
- Manual verification steps (no automated test suite in this repo)
- Edge cases

### 7. Approval gate

Ask the user to approve the plan before implementation.

### 8. Execute

Implement the approved plan in small steps.
After each logical step, run the narrowest useful check (`npm run lint`).

### 9. Verify

Run from the repository root:

```bash
npm run lint
npm run build        # includes tsc -b
npm run format:check # when formatting may be affected
```

Report failures and fix them. Do not run `npm test` — no test script exists.

### 10. Final report

Provide:

- changed files
- what was implemented vs AC
- lint / build results
- residual risks / follow-ups
