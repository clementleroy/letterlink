# AGENTS.md

## Scope
These instructions apply to all files under `skills/`.

## Skill authoring rules
- Each skill must have a folder named with kebab-case.
- Each skill folder must contain a `SKILL.md` with YAML frontmatter (`name`, `description`).
- Keep skill instructions practical and brief; prefer checklists/workflows over long prose.
- Add `agents/openai.yaml` metadata for each skill with a clear display name and default prompt.
- Store variant-specific deep detail in `references/` only when needed.
