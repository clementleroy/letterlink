---
name: letterlink-dev
description: Use this skill when implementing or refactoring Letterlink app features in React/TypeScript.
---

# Letterlink Development Skill

Use this workflow for product or engineering changes in the app.

## 1) Start with repo guidance

- Read `AGENTS.md` first.
- Treat `AGENTS.md` as the source of truth for architecture, state ownership, file placement, and validation.

## 2) Make changes in the right layer

- UI shells and screens: `src/features/`
- Shared presentational pieces: `src/components/`
- Shared state and workflow logic: `src/hooks/`
- Reusable logic and transforms: `src/lib/`
- Shared types: `src/types/`

Prefer extending existing modules over adding new top-level structure.

## 3) Preserve current patterns

- Keep components thin.
- Keep `src/lib/` focused on reusable non-UI logic.
- Reuse typed feedback and i18n patterns instead of introducing ad hoc strings or message handling.
- Route project mutations through the existing hook APIs rather than mutating data inside components.

## 4) Validate before hand-off

Run, in order:

1. `npm run lint`
2. `npm run build`

## 5) Handoff checklist

- Summarize user-facing impact.
- Mention any doc updates required by the change.
- Include a screenshot for UI changes when tooling is available.
