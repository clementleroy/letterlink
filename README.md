# Letterlink

Letterlink is a Vite + React app for generating letter-based artwork exports.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Cloudflare Pages deploy

This repo includes:

 - `wrangler.toml` with `dist` as the Pages output directory
 - `npm run deploy:cloudflare` for manual deploys
 - `.github/workflows/deploy-cloudflare.yml` for GitHub Actions deploys

To enable automatic deploys from GitHub, add these repository secrets:

 - `CLOUDFLARE_API_TOKEN`
 - `CLOUDFLARE_ACCOUNT_ID`

The workflow assumes the Cloudflare Pages project is named `letterlink`. If you create it with a different name, update the workflow file before deploying.

For a one-off local deploy:

```bash
npm run build
npm run deploy:cloudflare -- --project-name letterlink
```
