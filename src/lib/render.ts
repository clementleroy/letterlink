import paper from 'paper'
import svgpath from 'svgpath'
import type { GlyphMap } from './glyphs'
import type { InputItem, RenderedWord, TextRenderSettings } from '../types'

type GlyphShape = {
  pathData: string
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  height: number
  connectY: number
}

const clamp = (value: number, minimum: number) => Math.max(value, minimum)
const renderCache = new Map<string, RenderedWord>()
const scope = new paper.PaperScope()
scope.setup(new scope.Size(2048, 2048))

// Slight negative kerning derived from overlap so letters sit naturally close together.
// Not exposed to the user — overlap alone controls the cursive tightness.
function letterSpacingFromOverlap(overlapMm: number) {
  return -(overlapMm * 0.14)
}

function getCacheKey(item: InputItem, settings: TextRenderSettings) {
  return [
    item.name,
    settings.fontSizeMm,
    settings.overlapMm,
    settings.bridgeThicknessMm,
  ].join('|')
}

function pruneCache() {
  if (renderCache.size < 400) {
    return
  }

  const oldestKey = renderCache.keys().next().value
  if (oldestKey) {
    renderCache.delete(oldestKey)
  }
}

function buildGlyphShapes(
  glyphMap: GlyphMap,
  name: string,
  settings: TextRenderSettings,
): GlyphShape[] {
  const scale = settings.fontSizeMm / glyphMap.refSize
  const letterSpacing = letterSpacingFromOverlap(settings.overlapMm)
  let xCursor = 0

  return [...name].flatMap((char) => {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined) return []

    const glyph = glyphMap.glyphs.get(codePoint)
    if (!glyph) return []

    const advance = glyph.advance * scale
    xCursor += advance + letterSpacing - settings.overlapMm

    // Invisible glyph (e.g. space) — advance cursor but produce no shape
    if (!glyph.pathData || glyph.x1 === glyph.x2) return []

    const x1 = glyph.x1 * scale + (xCursor - advance - letterSpacing + settings.overlapMm)
    const y1 = glyph.y1 * scale
    const x2 = glyph.x2 * scale + (xCursor - advance - letterSpacing + settings.overlapMm)
    const y2 = glyph.y2 * scale
    // Clamp connectY to the baseline so descender letters (g, j, p, q, y…)
    // don't produce a bridge anchored deep in the descender zone.
    const connectY = Math.min(glyph.connectY * scale, glyphMap.baseline * scale)

    const originX = xCursor - advance - letterSpacing + settings.overlapMm
    const pathData = svgpath(glyph.pathData)
      .scale(scale)
      .translate(originX, 0)
      .round(3)
      .toString()

    return [
      {
        pathData,
        x1,
        y1,
        x2,
        y2,
        width: x2 - x1,
        height: y2 - y1,
        connectY,
      },
    ]
  })
}

function bridgeBetween(scope: paper.PaperScope, left: GlyphShape, right: GlyphShape, thickness: number) {
  const overscan = Math.max(thickness * 1.2, 1)
  const lx = left.x2 - overscan
  const ly = left.connectY
  const rx = right.x1 + overscan
  const ry = right.connectY

  const dx = rx - lx
  const dy = ry - ly
  const len = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001)
  // Unit tangent (along bridge) and unit normal (perpendicular)
  const tx = dx / len
  const ty = dy / len
  const nx = -ty
  const ny = tx

  const halfFull = clamp(thickness * 0.95, 0.55)
  const halfMid = halfFull * 0.62   // pinch at midpoint
  const tension = len * 0.3         // bezier handle magnitude

  const midX = (lx + rx) / 2
  const midY = (ly + ry) / 2

  // 6-point spindle: top-left → top-mid → top-right → bottom-right → bottom-mid → bottom-left
  // Handles are aligned along the tangent axis so curves flow smoothly along the bridge direction.
  const bridge = new scope.Path({ closed: true, insert: false })

  bridge.add(new scope.Segment(
    new scope.Point(lx + nx * halfFull, ly + ny * halfFull),
    undefined,
    new scope.Point(tx * tension, ty * tension),
  ))
  bridge.add(new scope.Segment(
    new scope.Point(midX + nx * halfMid, midY + ny * halfMid),
    new scope.Point(-tx * tension, -ty * tension),
    new scope.Point(tx * tension, ty * tension),
  ))
  bridge.add(new scope.Segment(
    new scope.Point(rx + nx * halfFull, ry + ny * halfFull),
    new scope.Point(-tx * tension, -ty * tension),
    undefined,
  ))
  bridge.add(new scope.Segment(
    new scope.Point(rx - nx * halfFull, ry - ny * halfFull),
    undefined,
    new scope.Point(-tx * tension, -ty * tension),
  ))
  bridge.add(new scope.Segment(
    new scope.Point(midX - nx * halfMid, midY - ny * halfMid),
    new scope.Point(tx * tension, ty * tension),
    new scope.Point(-tx * tension, -ty * tension),
  ))
  bridge.add(new scope.Segment(
    new scope.Point(lx - nx * halfFull, ly - ny * halfFull),
    new scope.Point(tx * tension, ty * tension),
    undefined,
  ))

  return bridge
}

function uniteShapes(shapes: GlyphShape[], settings: TextRenderSettings): string {
  let merged: paper.PathItem | null = null

  try {
    scope.project.clear()

    shapes.forEach((shape, index) => {
      const next = new scope.CompoundPath(shape.pathData)
      next.closed = true
      merged = merged ? merged.unite(next, { insert: false }) : next

      const adjacent = shapes[index + 1]
      if (adjacent && merged) {
        const bridge = bridgeBetween(scope, shape, adjacent, settings.bridgeThicknessMm)
        if (bridge) {
          merged = merged.unite(bridge, { insert: false })
        }
      }
    })

    if (!merged) {
      return ''
    }

    const finalMerged = merged as paper.PathItem
    const bounds = finalMerged.bounds
    const pathData = svgpath(finalMerged.pathData)
      .translate(-bounds.x, -bounds.y)
      .round(3)
      .toString()

    return pathData
  } finally {
    scope.project.clear()
  }
}

export function renderWord(
  item: InputItem,
  glyphMap: GlyphMap,
  settings: TextRenderSettings,
): RenderedWord | null {
  const cacheKey = getCacheKey(item, settings)
  const cached = renderCache.get(cacheKey)

  if (cached) {
    return {
      id: item.id,
      name: cached.name,
      pathData: cached.pathData,
      widthMm: cached.widthMm,
      heightMm: cached.heightMm,
    }
  }

  const glyphShapes = buildGlyphShapes(glyphMap, item.name, settings)

  if (glyphShapes.length === 0) {
    return null
  }

  const unitedPath = uniteShapes(glyphShapes, settings)

  if (!unitedPath) {
    return null
  }

  const bounds = glyphShapes.reduce(
    (accumulator, glyph) => ({
      x1: Math.min(accumulator.x1, glyph.x1),
      y1: Math.min(accumulator.y1, glyph.y1),
      x2: Math.max(accumulator.x2, glyph.x2),
      y2: Math.max(accumulator.y2, glyph.y2),
    }),
    {
      x1: Number.POSITIVE_INFINITY,
      y1: Number.POSITIVE_INFINITY,
      x2: Number.NEGATIVE_INFINITY,
      y2: Number.NEGATIVE_INFINITY,
    },
  )

  const result: RenderedWord = {
    id: item.id,
    name: item.name,
    pathData: unitedPath,
    widthMm: Math.max(0, bounds.x2 - bounds.x1),
    heightMm: Math.max(0, bounds.y2 - bounds.y1),
  }

  renderCache.set(cacheKey, {
    id: cacheKey,
    name: result.name,
    pathData: result.pathData,
    widthMm: result.widthMm,
    heightMm: result.heightMm,
  })
  pruneCache()

  return result
}
