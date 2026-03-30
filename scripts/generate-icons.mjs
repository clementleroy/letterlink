/**
 * Generates PWA icon PNGs from app-icon.svg using @resvg/resvg-js.
 *
 * apple-touch-icon.png  180×180  solid background (no transparency) – required by iOS
 * pwa-192x192.png       192×192  RGBA – used by Android / manifest
 * pwa-512x512.png       512×512  RGBA – used by Android / manifest
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgSource = readFileSync(join(publicDir, 'app-icon.svg'), 'utf8')

// For apple-touch-icon we prepend a solid background rect so there are
// no transparent pixels – iOS composites the image over black otherwise.
const BRAND_BG = '#fcf5ea'
const solidBgRect = `<rect width="256" height="256" fill="${BRAND_BG}"/>`
const svgWithSolidBg = svgSource.replace(/(<svg[^>]*>)/, `$1${solidBgRect}`)

function render(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

const icons = [
  { file: 'apple-touch-icon.png', size: 180, svg: svgWithSolidBg },
  { file: 'pwa-192x192.png',      size: 192, svg: svgSource },
  { file: 'pwa-512x512.png',      size: 512, svg: svgSource },
]

for (const { file, size, svg } of icons) {
  const png = render(svg, size)
  writeFileSync(join(publicDir, file), png)
  console.log(`✓ ${file}  (${size}×${size})`)
}
