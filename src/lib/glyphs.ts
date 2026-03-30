import type { LetterlinkAccentPart, LetterlinkGlyph, LetterlinkProject } from '../types'
import { materializeProjectGlyph, splitPathContours, type ProjectGlyphData } from './glyph-geometry'

type OpenTypeFont = import('opentype.js').Font

export type GlyphMap = {
  refSize: number
  baseline: number
  glyphs: Map<number, ProjectGlyphData>
  version: string
}

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

function uniqueChars(input: string) {
  return [...new Set([...input])]
}

function roundMetric(value: number) {
  return Number(value.toFixed(4))
}

function getFontFamily(font: OpenTypeFont, fileName: string) {
  const fullNameRecord = font.names.fullName as Record<string, string> | undefined
  const familyRecord = font.names.fontFamily as Record<string, string> | undefined

  return (
    fullNameRecord?.en ??
    familyRecord?.en ??
    familyRecord?.fr ??
    fileName.replace(/\.[^.]+$/, '')
  )
}

function buildAccentParts(contours: ReturnType<typeof splitPathContours>): {
  basePathData: string
  accentParts: LetterlinkAccentPart[]
} {
  if (contours.length <= 1) {
    return {
      basePathData: contours[0]?.pathData ?? '',
      accentParts: [],
    }
  }

  const baseContour = [...contours].sort((left, right) => right.area - left.area)[0]
  const baseHeight = Math.max(1, baseContour.bounds.y2 - baseContour.bounds.y1)
  const accentThreshold = baseContour.bounds.y1 - Math.max(2, baseHeight * 0.06)

  const accentContours = contours.filter((contour) => contour.center.y < accentThreshold)
  const accentPaths = new Set(accentContours.map((contour) => contour.pathData))
  const baseContours = contours.filter((contour) => !accentPaths.has(contour.pathData))

  if (accentContours.length === 0 || baseContours.length === 0) {
    return {
      basePathData: contours.map((contour) => contour.pathData).join(''),
      accentParts: [],
    }
  }

  return {
    basePathData: baseContours.map((contour) => contour.pathData).join(''),
    accentParts: accentContours.map((contour, index) => ({
      id: `accent-${index}`,
      label: `Accent ${index + 1}`,
      pathData: contour.pathData,
      xOffsetRefMm: 0,
      yOffsetRefMm: 0,
    })),
  }
}

function createProjectGlyph(
  font: OpenTypeFont,
  char: string,
  baseline: number,
): LetterlinkGlyph | null {
  const glyph = font.stringToGlyphs(char)[0]

  if (!glyph) {
    return null
  }

  const rawPath = glyph.getPath(0, baseline, REF_SIZE)
  const bbox = rawPath.getBoundingBox()
  const pathData = rawPath.toPathData(4) ?? ''
  const isVisible = pathData.trim().length > 0 && bbox.x1 !== Infinity && bbox.x2 !== Infinity
  const contours = isVisible ? splitPathContours(pathData) : []
  const { basePathData, accentParts } = buildAccentParts(contours)
  const codePoint = char.codePointAt(0)
  const connectY = isVisible ? roundMetric(bbox.y1 + (bbox.y2 - bbox.y1) * 0.72) : 0

  if (codePoint === undefined) {
    return null
  }

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

export async function createProjectFromFontFile(file: File): Promise<LetterlinkProject> {
  const { default: opentype } = await import('opentype.js')
  const buffer = await file.arrayBuffer()
  const font = opentype.parse(buffer)
  const baseline = roundMetric(font.ascender * (REF_SIZE / font.unitsPerEm))
  const now = new Date().toISOString()
  const glyphs = uniqueChars(SUPPORTED_CHARS)
    .map((char) => createProjectGlyph(font, char, baseline))
    .filter((glyph): glyph is LetterlinkGlyph => Boolean(glyph))

  if (glyphs.length === 0) {
    throw new Error('Impossible d’extraire des glyphes depuis cette police.')
  }

  return {
    fileType: 'letterlink-project',
    version: 1,
    refSize: REF_SIZE,
    baseline,
    createdAt: now,
    updatedAt: now,
    source: {
      kind: 'font',
      fileName: file.name,
      fontFamily: getFontFamily(font, file.name),
      unitsPerEm: font.unitsPerEm,
    },
    glyphs,
  }
}

export function createGlyphMap(project: LetterlinkProject): GlyphMap {
  const glyphs = new Map<number, ProjectGlyphData>()

  project.glyphs.forEach((glyph) => {
    glyphs.set(glyph.codePoint, materializeProjectGlyph(glyph))
  })

  return {
    refSize: project.refSize,
    baseline: project.baseline,
    glyphs,
    version: JSON.stringify(project),
  }
}
