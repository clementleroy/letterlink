# CLAUDE.md

This file provides guidance for AI assistants working with the Letterlink codebase.

## Project Overview

Letterlink is a client-side React/TypeScript SPA for generating letter-based artwork. Users upload a TTF font, configure per-glyph anchor points and accent marks, enter names/words via text or CSV, and export multi-page SVG boards ready for cutting or printing. There is no backend — all state lives in React hooks and localStorage.

## Repository Structure

```
src/
├── App.tsx                  # Root component; wires all three state hooks
├── main.tsx                 # React entry point
├── index.css                # Global theme variables and base styles
├── components/              # Shared, stateless UI components
│   ├── AppHero.tsx          # Header with live project statistics
│   ├── ProjectStatusStrip.tsx  # Font/project readiness indicator
│   └── WorkspaceSwitcher.tsx   # "Prepare" / "Configure" tab toggle
├── features/
│   ├── configurator/        # Board layout + SVG export workspace
│   │   ├── ConfiguratorWorkspace.tsx       # Workspace shell
│   │   ├── ConfiguratorControlsPanel.tsx   # Board/render settings, CSV input
│   │   └── BoardPreviewPanel.tsx           # SVG preview and download controls
│   └── project-workflow/    # Font loading + glyph editing workspace
│       ├── PrepareWorkspace.tsx     # Workspace shell
│       ├── ProjectInputsPanel.tsx   # Text/CSV input for the configurator
│       └── GlyphEditorPanel.tsx     # Interactive anchor/accent editor
├── hooks/
│   ├── useLetterlinkProject.ts  # Font parsing, project CRUD, localStorage
│   ├── useConfiguratorState.ts  # Board settings, CSV parsing, pagination
│   └── useGlyphEditorState.ts   # Glyph selection, anchor/accent drag logic
├── lib/                     # Pure, DOM-free utility modules
│   ├── constants.ts         # Default settings and sample data
│   ├── export.ts            # SVG doc building, ZIP export, JSON serialization
│   ├── font.ts              # Font utility stub
│   ├── glyph-editor.ts      # Anchor/accent state helpers
│   ├── glyph-geometry.ts    # SVG path parsing, contour detection, accent splitting
│   ├── glyphs.ts            # opentype.js font parsing + glyph extraction
│   ├── input.ts             # CSV/text → item list parsing
│   ├── layout.ts            # Shelf-bin packing algorithm for board pagination
│   ├── project-store.ts     # localStorage persistence and project normalization
│   ├── render.ts            # Paper.js word rendering with caching
│   └── svg.ts               # SVG document template
├── styles/
│   ├── app-shell.css        # Layout grid, panels, buttons
│   ├── configurator.css     # Preview panel and controls styles
│   └── project-workflow.css # Glyph editor styles
└── types/                   # Shared TypeScript type definitions
```

## Technology Stack

| Layer | Library | Version |
|-------|---------|---------|
| UI framework | React | 19.x |
| Language | TypeScript | 5.9.x (strict) |
| Build tool | Vite | 8.x |
| Vector graphics | Paper.js | 0.12.x |
| Font parsing | opentype.js | 1.3.x |
| Path manipulation | svgpath | 2.6.x |
| Polygon ops | @flatten-js/core | 1.6.x |
| CSV parsing | PapaParse | 5.5.x |
| ZIP export | JSZip | 3.10.x |
| Deployment | Cloudflare Pages + Wrangler | 4.x |
| Linting | ESLint 9 (flat config) | 9.x |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server with HMR
npm run lint         # Run ESLint on all files
npm run build        # tsc -b + vite build + copy 404.html
npm run preview      # Preview the production build locally
npm run deploy:cloudflare  # Build and deploy to Cloudflare Pages
```

**Always run `npm run lint` then `npm run build` before committing.** Both must pass clean. There is no test suite — TypeScript's strict mode and ESLint are the primary quality gates.

## Architecture: Three State Hooks

All application state flows through three hooks composed in `App.tsx`:

```
useLetterlinkProject   →  font / project data (glyphMap, project, readiness)
useConfiguratorState   →  board settings, layout pages, CSV items
useGlyphEditorState    →  selected glyph, anchors, accent drag state
```

`App.tsx` wires them together and passes props down. State does **not** live in feature components — it stays in hooks and is passed explicitly. Avoid introducing new top-level state hooks without a clear architectural reason.

## Key Conventions

### TypeScript
- Strict mode is enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). All checks must pass.
- Use explicit return types on all public helper functions in `src/lib/`.
- Avoid `any`. If unavoidable, leave a comment explaining why.
- Import types with `import type { ... }` where possible.

### React Components
- Components are thin: they receive props and render UI or delegate events.
- No business logic or data transformation inside components — put that in `src/lib/` modules.
- Keep components and hooks small and focused. Split before they get large.
- Prop drilling is intentional here. Do not reach for a context or state library without discussion.

### `src/lib/` Modules
- Must remain pure (no DOM access, no React imports, no side effects at module load).
- `render.ts` is the exception — it uses Paper.js which requires a canvas context.
- Reuse existing helpers before adding new modules.
- Keep `export.ts` contracts stable; downstream consumers depend on its exported functions.

### Styles
- Global CSS variables are defined in `src/index.css`.
- Feature-specific styles live in `src/styles/` and are imported in `App.tsx`.
- Color palette: `--panel: rgba(252,248,242,0.92)`, `--accent: #ba6c26`, `--heading: #251b14`.
- Do not use inline styles for layout; add a class instead.

### No Backend / No Env Vars
- There is no server, API, or database.
- No `.env` files are needed. All defaults live in `src/lib/constants.ts`.
- All persistent data uses `localStorage` key `letterlink-active-project-v2`.

## Data Flow

```
Font file (TTF)
  └─► opentype.js → glyph SVG paths
        └─► glyph-geometry.ts → contour/accent detection
              └─► Project (glyphMap) in localStorage

CSV / text input
  └─► input.ts → item list
        └─► layout.ts → paginated boards (shelf-bin packing)
              └─► render.ts (Paper.js) → positioned word shapes
                    └─► export.ts → SVG documents / ZIP
```

## Deployment

The app is deployed to **Cloudflare Pages**.

- **CI/CD**: Push to `main` triggers `.github/workflows/deploy-cloudflare.yml` automatically.
- **Manual deploy**: `npm run deploy:cloudflare` (requires Cloudflare credentials in env).
- **Required GitHub Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (optional: `CLOUDFLARE_PROJECT_NAME`, defaults to `"letterlink"`).
- **Output directory**: `dist/` — Vite bundles the SPA there; `dist/404.html` is a copy of `index.html` for SPA routing.
- Verify `wrangler.toml` still points output to `dist` before any deployment changes.

## Skills

Reusable automation playbooks live in `skills/`. Use the matching skill when applicable:

| Skill | When to use |
|-------|-------------|
| `skills/letterlink-dev/SKILL.md` | Implementing or refactoring app features |
| `skills/letterlink-release/SKILL.md` | Preparing a release or deploying |

## File Modification Guidelines

| Area | Where to change |
|------|----------------|
| New UI control or display | Add to the relevant feature component in `src/features/` |
| New business logic / algorithm | Add to or extend a module in `src/lib/` |
| New shared state | Extend the appropriate hook in `src/hooks/` |
| New reusable UI element | Add to `src/components/` |
| New TypeScript types | Add to `src/types/` |
| Default values / constants | Edit `src/lib/constants.ts` |
| Build / deploy config | `vite.config.ts`, `wrangler.toml`, `package.json` scripts |

## Common Pitfalls

- **Do not** import React state or DOM APIs into `src/lib/` modules — keep them pure.
- **Do not** mutate the `project` object directly; always use `projectState.updateGlyph` or the store helpers.
- **Do not** skip the `npm run build` check — TypeScript errors that slip past the editor will surface there.
- **Do not** add a backend or server-side dependency; the architecture is intentionally client-only.
- When adding Paper.js rendering code, be aware it uses a hidden canvas and is not React-controlled — side-effect isolation matters.
