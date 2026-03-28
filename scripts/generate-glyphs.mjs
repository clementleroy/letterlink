/**
 * Generates public/glyphs.svg from the bundled Pacifico TTF.
 *
 * Each character is stored as a <path> with:
 *   id="g-{codePoint}"
 *   data-advance   — advance width at REF_SIZE mm
 *   data-x1/y1/x2/y2 — bounding box at REF_SIZE mm
 *   data-connect-y — bridge-attachment Y at REF_SIZE mm
 *   d              — raw SVG path data (origin at x=0, baseline at data-baseline)
 *
 * To edit a glyph (e.g. connect an accent to its base letter):
 *   1. Open public/glyphs.svg in Inkscape / Illustrator.
 *   2. Find the relevant <path> by its id (e.g. id="g-233" for é).
 *   3. Edit / union the sub-paths so the accent is physically connected.
 *   4. Save and rebuild the app.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import opentype from 'opentype.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REF_SIZE = 100 // reference font size in mm

// Characters to export
const CHARS = [
  // Printable ASCII (except DEL)
  ' !"#$%&\'()*+,-./0123456789:;<=>?@',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`',
  'abcdefghijklmnopqrstuvwxyz{|}~',
  // Extended Latin — accented and special characters
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ',
  'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
  'ŒœŸ',
  'ß',
].join('')

async function main() {
  const fontPath = join(__dirname, '..', 'public', 'Pacifico-Regular.ttf')
  const fontBuffer = await readFile(fontPath)
  const font = opentype.parse(fontBuffer.buffer)

  const scale = REF_SIZE / font.unitsPerEm
  const baseline = font.ascender * scale

  const seen = new Set()
  const pathElements = []

  for (const char of CHARS) {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined || seen.has(codePoint)) continue
    seen.add(codePoint)

    const glyphs = font.stringToGlyphs(char)
    if (glyphs.length === 0) continue
    const glyph = glyphs[0]

    const advance = (glyph.advanceWidth ?? font.unitsPerEm * 0.5) * scale
    const otPath = glyph.getPath(0, baseline, REF_SIZE)
    const bbox = otPath.getBoundingBox()
    const pathData = otPath.toPathData(4)

    const isVisible = pathData && bbox.x1 !== Infinity

    const attrs = [
      `id="g-${codePoint}"`,
      `data-advance="${advance.toFixed(4)}"`,
    ]

    if (isVisible) {
      attrs.push(`data-x1="${bbox.x1.toFixed(4)}"`)
      attrs.push(`data-y1="${bbox.y1.toFixed(4)}"`)
      attrs.push(`data-x2="${bbox.x2.toFixed(4)}"`)
      attrs.push(`data-y2="${bbox.y2.toFixed(4)}"`)
      const connectY = bbox.y1 + (bbox.y2 - bbox.y1) * 0.72
      attrs.push(`data-connect-y="${connectY.toFixed(4)}"`)
    }

    attrs.push(`d="${(pathData ?? '').replace(/"/g, '&quot;')}"`)

    pathElements.push(`  <path ${attrs.join(' ')}/>`)
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    `     id="letterlink-glyphs"`,
    `     data-ref-size="${REF_SIZE}"`,
    `     data-baseline="${baseline.toFixed(4)}">`,
    ...pathElements,
    `</svg>`,
  ].join('\n')

  const outPath = join(__dirname, '..', 'public', 'glyphs.svg')
  await writeFile(outPath, svg, 'utf8')
  console.log(`Generated ${pathElements.length} glyphs → ${outPath}`)
}

main().catch(console.error)
