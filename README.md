# Letterlink

Letterlink is a Vite + React app for generating letter-based artwork from editable glyph setups. It loads a default project on first visit, lets you adjust per-letter anchors and accent placement, lays out names across printable boards, and exports SVG output for production.

## Development

```bash
npm install
npm run dev
```

Useful local commands:

```bash
npm run lint
npm run build
npm run preview
```

Screenshot-friendly dev and preview servers for Codex or browser tooling:

```bash
npm run dev:codex
npm run preview:codex
```

## App flow

1. Start from the bundled default project in [`public/default-project.json`](./public/default-project.json), upload a font, or open a saved Letterlink project.
2. Adjust glyph anchors and accent positioning in the Prepare workspace.
3. Enter names from text or CSV and tune board/render settings in the Configure workspace.
4. Preview paginated boards and export SVG files for a single board or a ZIP archive of all boards.

The app is fully client-side. Active project data and language preference are stored in the browser via `localStorage`.

## Architecture overview

- [`src/App.tsx`](./src/App.tsx) composes the app shell and switches between the Prepare and Configure workspaces.
- [`src/hooks/useLetterlinkProject.ts`](./src/hooks/useLetterlinkProject.ts) handles project import, autosave, default-project bootstrap, and user-facing project feedback.
- [`src/hooks/useGlyphEditorState.ts`](./src/hooks/useGlyphEditorState.ts) handles glyph selection, anchor placement, and accent drag interactions.
- [`src/hooks/useConfiguratorState.ts`](./src/hooks/useConfiguratorState.ts) handles text/CSV inputs, board settings, render settings, pagination, and export status.
- [`src/lib/`](./src/lib/) contains reusable logic for rendering, glyph processing, i18n, import/export, layout, and persistence.

## Quality gate

Run these before shipping changes:

```bash
npm run lint
npm run build
```

## Cloudflare Pages deploy

This repo includes:

- `wrangler.toml` with `pages_build_output_dir = "dist"`
- `npm run deploy:cloudflare` for local/manual deploys
- `.github/workflows/deploy-cloudflare.yml` for GitHub Actions deploys

Manual deploy flow:

1. Authenticate Wrangler once:

   ```bash
   npx wrangler login
   ```

2. Export your Cloudflare account id:

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
   ```

3. Deploy:

   ```bash
   npm run deploy:cloudflare
   ```

By default the deploy script targets the `letterlink` Pages project. Override with:

```bash
CLOUDFLARE_PROJECT_NAME=my-pages-project npm run deploy:cloudflare
```

You can also deploy a specific branch:

```bash
npm run deploy:cloudflare -- --branch main
```

For GitHub Actions deploys, configure:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional repository variable:

- `CLOUDFLARE_PROJECT_NAME`
