---
name: letterlink-release
description: Use this skill when preparing Letterlink for release or Cloudflare Pages deployment.
---

# Letterlink Release Skill

Use this workflow before release or deployment work.

## 1) Follow repo guidance

- Read `AGENTS.md` for the current deployment and validation contract.
- Use `README.md` for the public-facing deploy steps and command references.

## 2) Run the quality gate

1. `npm run lint`
2. `npm run build`

## 3) Check deployment readiness

- Confirm `wrangler.toml` still points Pages output to `dist`.
- Confirm `package.json` still exposes `deploy:cloudflare`.
- If the workflow changed, verify `.github/workflows/deploy-cloudflare.yml` still uses the expected Cloudflare secret and variable names.

## 4) Release hand-off

- Summarize user-visible changes.
- Call out deployment or export risks.
- Mention rollback guidance when the release changes rendering, export, or deployment behavior.
