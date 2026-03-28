import paper from 'paper'
import type { Font, Glyph } from 'opentype.js'
import svgpath from 'svgpath'
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

function getCacheKey(item: InputItem, settings: TextRenderSettings) {
  return [
    item.name,
    settings.fontSizeMm,
    settings.letterSpacingMm,
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
  font: Font,
  name: string,
  settings: TextRenderSettings,
): GlyphShape[] {
  const glyphs = font.stringToGlyphs(name)
  const scale = settings.fontSizeMm / font.unitsPerEm
  const baseline = font.ascender * scale
  let xCursor = 0

  return glyphs.flatMap((glyph: Glyph, index: number) => {
    const path = glyph.getPath(xCursor, baseline, settings.fontSizeMm)
    const bbox = path.getBoundingBox()
    const pathData = path.toPathData(3)
    const nextAdvance = (glyph.advanceWidth ?? font.unitsPerEm * 0.5) * scale
    const kerning = index < glyphs.length - 1
      ? font.getKerningValue(glyph, glyphs[index + 1]) * scale
      : 0

    xCursor += nextAdvance + kerning + settings.letterSpacingMm - settings.overlapMm

    if (!pathData || bbox.x1 === Number.POSITIVE_INFINITY) {
      return []
    }

    return [
      {
        pathData,
        x1: bbox.x1,
        y1: bbox.y1,
        x2: bbox.x2,
        y2: bbox.y2,
        width: bbox.x2 - bbox.x1,
        height: bbox.y2 - bbox.y1,
        connectY: bbox.y1 + (bbox.y2 - bbox.y1) * 0.72,
      },
    ]
  })
}

function bridgeBetween(scope: paper.PaperScope, left: GlyphShape, right: GlyphShape, thickness: number) {
  const overscan = Math.max(thickness * 1.2, 1)
  const leftAnchor = new scope.Point(left.x2 - overscan, left.connectY)
  const rightAnchor = new scope.Point(right.x1 + overscan, right.connectY)
  const vector = rightAnchor.subtract(leftAnchor)
  const length = Math.max(vector.length, 0.001)
  const normal = new scope.Point(-vector.y / length, vector.x / length)
  const halfThickness = clamp(thickness * 0.95, 0.55)

  const bridge = new scope.Path({
    closed: true,
    insert: false,
  })

  bridge.add(leftAnchor.add(normal.multiply(halfThickness)))
  bridge.add(rightAnchor.add(normal.multiply(halfThickness)))
  bridge.add(rightAnchor.subtract(normal.multiply(halfThickness)))
  bridge.add(leftAnchor.subtract(normal.multiply(halfThickness)))
  bridge.smooth({ type: 'continuous' })

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
  font: Font,
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

  const glyphShapes = buildGlyphShapes(font, item.name, settings)

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
