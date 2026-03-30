---
name: letterlink-dev
description: Use this skill when implementing or refactoring Letterlink app features in React/TypeScript, including canvas/render/export paths and UI controls.
---

# Letterlink Development Skill

Use this workflow for feature work in the app.

## 1) Plan the change
- Identify whether changes are UI-only (`src/App.tsx`, CSS) or rendering/export logic (`src/lib/*`).
- Reuse existing helpers before introducing new modules.

## 2) Implement safely
- Keep types explicit for public helper function signatures.
- Keep pure transform helpers in `src/lib/` and avoid mixing DOM/UI state into them.
- Preserve existing export contracts from `src/lib/export.ts`.

## 3) Validate
Run, in order:
1. `npm run lint`
2. `npm run build`

If either fails, fix before hand-off.

## 4) Handoff checklist
- Summarize user-facing impact.
- List modified files grouped by concern (UI, rendering, export).
- Note any follow-up work or edge cases not addressed.
