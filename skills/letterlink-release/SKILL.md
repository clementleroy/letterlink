---
name: letterlink-release
description: Use this skill when preparing Letterlink for release/deploy, including local quality checks and Cloudflare Pages deployment readiness.
---

# Letterlink Release Readiness Skill

Use this workflow before release or deployment.

## 1) Quality gate
Run:
1. `npm run lint`
2. `npm run build`

## 2) Deployment readiness checks
- Confirm `wrangler.toml` still points Pages output to `dist`.
- Confirm any deployment-related script changes in `package.json` still use `deploy:cloudflare`.
- If CI workflow files are updated, verify project name and secret names remain correct.

## 3) Release note checklist
- Include key UI/behavior changes.
- Include any risk notes (export compatibility, rendering differences, performance).
- Include rollback hint (revert commit or re-deploy previous known-good build).
