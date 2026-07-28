---
last-updated: 2026-07-28
issue: 18
---

# Plan: #18 Add `draft-to-requirement` Cursor skill

## Type

feature

## Risk

low — docs/skill only; no app runtime code

## Summary

Create a project Cursor skill `draft-to-requirement` that turns a rough feature draft (any language) into an English requirements markdown file under `.cursor/requirements/`, with sequential clarification, approval gate, and optional GitHub issue creation. Also ensure `.cursor/requirements/` exists.

## Acceptance criteria (from issue)

- [x] Skill at `.cursor/skills/draft-to-requirement/SKILL.md`, structured like `ticket-plan`
- [x] Frontmatter `name` + `description` mentioning invoke name, any-language draft, English output path, optional GitHub issue after approval
- [x] Instructs reading `.cursor/AGENTS.md`, `.cursor/docs/frontend/react-module-architecture.md`, and `.cursor/rules/frontend/react-architecture.mdc` before clarifying/writing
- [x] Any-language input → English requirements file
- [x] Sequential clarification (one question → wait → analyze → next)
- [x] Announce when clarification is complete, then write the file
- [x] Output: `.cursor/requirements/<slug>.md` with recommended sections + `last-updated` frontmatter
- [x] After save: ask user approval; offer GitHub issue only after explicit confirmation
- [x] Issue via GitHub MCP `issue_write` when available; fallback `gh issue create --body-file`
- [x] Usage documented: `draft-to-requirement` + draft in same message
- [x] `.cursor/requirements/` directory exists

## Files to change / create

| Path                                           | Action                               |
| ---------------------------------------------- | ------------------------------------ |
| `.cursor/skills/draft-to-requirement/SKILL.md` | create — full skill workflow         |
| `.cursor/requirements/.gitkeep`                | create — ensure directory is tracked |

## Local patterns

- Mirror structure/tone of `.cursor/skills/ticket-plan/SKILL.md` (numbered steps, tables for tools, approval gate, final report)
- Follow create-skill conventions: YAML frontmatter with `name` + trigger-rich `description`
- Requirements docs style: frontmatter `last-updated` like other `.cursor/docs/` files

## Ordered steps

1. Create `.cursor/requirements/.gitkeep` so the directory exists and is committed.
2. Author `.cursor/skills/draft-to-requirement/SKILL.md` encoding all behavior from the issue:
   - Inputs / how to invoke
   - Read project context (AGENTS, architecture doc, react-architecture rule, integrations when relevant)
   - Draft missing → ask for paste
   - Clarify one question at a time (same language as draft); announce when enough info
   - Write English requirements with recommended sections + frontmatter
   - Final report
   - Approval gate + optional GitHub issue (MCP first, `gh` fallback; never without confirmation)
3. Spot-check skill against AC checklist and `ticket-plan` structure.
4. Verification: no app lint/build impact expected; confirm files exist and frontmatter/description cover AC.

## Manual verification

- [ ] Open skill file; confirm YAML `name: draft-to-requirement` and description triggers
- [ ] Confirm all AC bullets are encoded as agent instructions
- [ ] Confirm `.cursor/requirements/` exists
- [ ] (Optional smoke) Invoke skill mentally against sample draft path

## Edge cases

- Skill invoked with no draft → ask for draft, do not invent requirements
- MCP unavailable → fall back to `gh`; if both missing, report and ask user to create issue manually / paste content
- User rejects requirements → revise file and re-run approval before offering issue creation
- Mixed-language draft → still produce fully English requirements (keep proper nouns / API ids as needed)

## Out of scope

- Implementing any product feature described in sample drafts
- Wiring the skill into AGENTS.md beyond creating the skill itself (issue does not require AGENTS update)
- Automated tests
