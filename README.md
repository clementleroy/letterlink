# Letterlink

Letterlink is a Vite + React app for generating letter-based artwork exports.

## Development

```bash
npm install
npm run dev
```

### Screenshot-friendly dev server (Codex/browser tooling)

Some remote browser tools need a fixed host/port to capture UI screenshots.
Use these scripts when running in Codex or similar environments:

```bash
npm run dev:codex
```

This binds Vite to `0.0.0.0:4173` with `--strictPort`, so screenshot tooling can
reliably connect.

To preview a production build with the same network settings:

```bash
npm run build
npm run preview:codex
```

## Production build

```bash
npm run build
```

## Per-letter glyph configuration

Persistent per-letter adjustments live in
[`src/lib/glyph-config.ts`](./src/lib/glyph-config.ts).

You can define overrides per character for:

- `xOffsetRefMm`
- `yOffsetRefMm`
- `advanceAdjustRefMm`
- `connectYAdjustRefMm`
- `leftConnectXRefMm`
- `leftConnectYRefMm`
- `rightConnectXRefMm`
- `rightConnectYRefMm`
- `scaleX`
- `scaleY`

These values are stored in the same reference millimeter space as
`public/glyphs.svg`, then scaled automatically at render time.

## Cloudflare Pages deploy

This repo includes:

- `wrangler.toml` configured with `pages_build_output_dir = "dist"`
- `npm run deploy:cloudflare` for local/manual deploys (build + deploy)
- `.github/workflows/deploy-cloudflare.yml` for GitHub Actions deploys

### One-command local deploy

1. Authenticate Wrangler once:

   ```bash
   npx wrangler login
   ```

2. Set your Cloudflare account id (required):

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
   ```

3. Deploy:

   ```bash
   npm run deploy:cloudflare
   ```

By default the deploy target is the `letterlink` Pages project. To deploy to a different project:

```bash
CLOUDFLARE_PROJECT_NAME=my-pages-project npm run deploy:cloudflare
```

You can also pass a branch explicitly:

```bash
npm run deploy:cloudflare -- --branch main
```

### GitHub Actions deploy requirements

To enable automatic deploys from GitHub, add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional repository variable:

- `CLOUDFLARE_PROJECT_NAME` (defaults to `letterlink`)

If you use Cloudflare Pages' Git integration instead of this workflow, set these build settings in the Pages dashboard:

- Build command: `npm run build`
- Build output directory: `dist`
