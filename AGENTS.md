# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Project overview
- Letterlink is a Vite + React + TypeScript app for generating letter-based artwork.
- Build artifacts are produced in `dist/` and can be deployed to Cloudflare Pages.

## Development workflow
1. Install dependencies: `npm install`
2. Run local dev server: `npm run dev`
3. Run static checks before committing: `npm run lint`
4. Verify production output: `npm run build`

## Code-change expectations
- Keep React components and utility code small and focused.
- Prefer extending existing modules in `src/lib/` before adding new top-level folders.
- Preserve strict TypeScript typing; avoid introducing `any` unless there is no viable alternative.
- For UI-facing changes, include a screenshot in the PR/hand-off when tooling is available.

## Skill usage in this repo
- Reusable development playbooks live in `skills/`.
- If a request maps to one of those skills, follow the matching `SKILL.md` workflow.
