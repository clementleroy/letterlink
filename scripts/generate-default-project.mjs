/**
 * Generates public/default-project.json from the bundled Pacifico TTF.
 *
 * The output is a full LetterlinkProject (wrapped in a ProjectFileEnvelope)
 * with per-glyph anchor points and accent-part detection, exactly as if the
 * user had uploaded the font through the app.
 *
 * Run via:  node scripts/generate-default-project.mjs
 * Or:       npm run generate:default-project
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import opentype from 'opentype.js'
import paper from '../node_modules/paper/dist/paper-full.js'
import svgpath from 'svgpath'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Constants (mirror src/lib/glyphs.ts) ────────────────────────────────────

const REF_SIZE = 100

const SUPPORTED_CHARS = [
  ' !"#$%&\'()*+,-./0123456789:;<=>?@',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`',
  'abcdefghijklmnopqrstuvwxyz{|}~',
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ',
  'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
  'ŒœŸ',
  'ß',
].join('')

// ─── Paper.js setup (headless) ────────────────────────────────────────────────

const scope = new paper.PaperScope()
scope.setup(new scope.Size(1024, 1024))

// ─── Helpers (mirror src/lib/glyph-geometry.ts + src/lib/glyphs.ts) ──────────

function roundMetric(value) {
  return Number(value.toFixed(4))
}

function uniqueChars(input) {
  return [...new Set([...input])]
}

function getFontFamily(font, fileName) {
  const fullNameRecord = font.names.fullName
  const familyRecord = font.names.fontFamily
  return (
    fullNameRecord?.en ??
    familyRecord?.en ??
    familyRecord?.fr ??
    fileName.replace(/\.[^.]+$/, '')
  )
}

/**
 * Splits an SVG compound path into individual contour geometries using
 * Paper.js — mirrors splitPathContours() in src/lib/glyph-geometry.ts.
 */
function splitPathContours(pathData) {
  if (!pathData.trim()) return []

  scope.project.clear()
  try {
    const compoundPath = new scope.CompoundPath(pathData)
    const children = compoundPath.children?.length > 0 ? compoundPath.children : [compoundPath]

    return children.map((child) => {
      const clone = child.clone({ insert: false })
      const bounds = clone.bounds
      return {
        pathData: svgpath(clone.pathData).round(3).toString(),
        center: { x: bounds.center.x, y: bounds.center.y },
        area: Math.abs(bounds.width * bounds.height),
        bounds: {
          x1: bounds.x,
          y1: bounds.y,
          x2: bounds.x + bounds.width,
          y2: bounds.y + bounds.height,
        },
      }
    })
  } finally {
    scope.project.clear()
  }
}

/**
 * Separates accent contours from the base letter — mirrors buildAccentParts()
 * in src/lib/glyphs.ts.
 */
function buildAccentParts(contours) {
  if (contours.length <= 1) {
    return {
      basePathData: contours[0]?.pathData ?? '',
      accentParts: [],
    }
  }

  const baseContour = [...contours].sort((a, b) => b.area - a.area)[0]
  const baseHeight = Math.max(1, baseContour.bounds.y2 - baseContour.bounds.y1)
  const accentThreshold = baseContour.bounds.y1 - Math.max(2, baseHeight * 0.06)

  const accentContours = contours.filter((c) => c.center.y < accentThreshold)
  const accentPaths = new Set(accentContours.map((c) => c.pathData))
  const baseContours = contours.filter((c) => !accentPaths.has(c.pathData))

  if (accentContours.length === 0 || baseContours.length === 0) {
    return {
      basePathData: contours.map((c) => c.pathData).join(''),
      accentParts: [],
    }
  }

  return {
    basePathData: baseContours.map((c) => c.pathData).join(''),
    accentParts: accentContours.map((contour, index) => ({
      id: `accent-${index}`,
      label: `Accent ${index + 1}`,
      pathData: contour.pathData,
      xOffsetRefMm: 0,
      yOffsetRefMm: 0,
    })),
  }
}

/**
 * Creates a single LetterlinkGlyph — mirrors createProjectGlyph() in
 * src/lib/glyphs.ts.
 */
function createProjectGlyph(font, char, baseline) {
  const glyph = font.stringToGlyphs(char)[0]
  if (!glyph) return null

  const rawPath = glyph.getPath(0, baseline, REF_SIZE)
  const bbox = rawPath.getBoundingBox()
  const pathData = rawPath.toPathData(4) ?? ''
  const isVisible = pathData.trim().length > 0 && bbox.x1 !== Infinity && bbox.x2 !== Infinity
  const contours = isVisible ? splitPathContours(pathData) : []
  const { basePathData, accentParts } = buildAccentParts(contours)
  const codePoint = char.codePointAt(0)
  const connectY = isVisible ? roundMetric(bbox.y1 + (bbox.y2 - bbox.y1) * 0.72) : 0

  if (codePoint === undefined) return null

  return {
    char,
    codePoint,
    advance: roundMetric((glyph.advanceWidth ?? font.unitsPerEm * 0.5) * (REF_SIZE / font.unitsPerEm)),
    connectY,
    basePathData: isVisible ? basePathData : '',
    xOffsetRefMm: 0,
    yOffsetRefMm: 0,
    advanceAdjustRefMm: 0,
    connectYAdjustRefMm: 0,
    leftConnectXRefMm: isVisible ? roundMetric(bbox.x1) : null,
    leftConnectYRefMm: isVisible ? connectY : null,
    rightConnectXRefMm: isVisible ? roundMetric(bbox.x2) : null,
    rightConnectYRefMm: isVisible ? connectY : null,
    scaleX: 1,
    scaleY: 1,
    accentParts,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const fontPath = join(__dirname, '..', 'public', 'Pacifico-Regular.ttf')
  const fontBuffer = await readFile(fontPath)
  const font = opentype.parse(fontBuffer.buffer)

  const baseline = roundMetric(font.ascender * (REF_SIZE / font.unitsPerEm))
  const now = new Date().toISOString()

  console.log(`Parsing ${font.names.fullName?.en ?? 'font'} (${font.unitsPerEm} UPM, baseline=${baseline})…`)

  const glyphs = uniqueChars(SUPPORTED_CHARS)
    .map((char) => createProjectGlyph(font, char, baseline))
    .filter(Boolean)

  console.log(`Extracted ${glyphs.length} glyphs (${glyphs.filter((g) => g.accentParts.length > 0).length} with accents)`)

  const project = {
    fileType: 'letterlink-project',
    version: 1,
    refSize: REF_SIZE,
    baseline,
    createdAt: now,
    updatedAt: now,
    source: {
      kind: 'font',
      fileName: 'Pacifico-Regular.ttf',
      fontFamily: getFontFamily(font, 'Pacifico-Regular.ttf'),
      unitsPerEm: font.unitsPerEm,
    },
    glyphs,
  }

  const envelope = {
    fileType: 'letterlink-project',
    version: 1,
    project,
  }

  const outPath = join(__dirname, '..', 'public', 'default-project.json')
  await writeFile(outPath, JSON.stringify(envelope), 'utf8')
  console.log(`Written → ${outPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
