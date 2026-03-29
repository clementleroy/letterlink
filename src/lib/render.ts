import paper from 'paper'
import svgpath from 'svgpath'
import type { GlyphMap } from './glyphs'
import type { GlyphDebugAnchor, InputItem, RenderedWord, TextRenderSettings } from '../types'

type GlyphShape = {
  char: string
  pathData: string
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  height: number
  leftConnectX: number
  leftConnectY: number
  rightConnectX: number
  rightConnectY: number
}

const clamp = (value: number, minimum: number) => Math.max(value, minimum)
const renderCache = new Map<string, RenderedWord>()
const scope = new paper.PaperScope()
scope.setup(new scope.Size(2048, 2048))

function getCacheKey(item: InputItem, settings: TextRenderSettings, glyphVersion: string) {
  return [
    glyphVersion,
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
  glyphMap: GlyphMap,
  name: string,
  settings: TextRenderSettings,
): GlyphShape[] {
  const scale = settings.fontSizeMm / glyphMap.refSize
  let xCursor = 0

  return [...name].flatMap((char) => {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined) return []

    const glyph = glyphMap.glyphs.get(codePoint)
    if (!glyph) return []

    const advance = (glyph.advance + glyph.advanceAdjustRefMm) * scale
    xCursor += advance + settings.letterSpacingMm - settings.overlapMm

    // Invisible glyph (e.g. space) — advance cursor but produce no shape
    if (!glyph.pathData || glyph.x1 === glyph.x2) return []

    const originX = xCursor - advance - settings.letterSpacingMm + settings.overlapMm
    const glyphOffsetX = glyph.xOffsetRefMm * scale
    const glyphOffsetY = glyph.yOffsetRefMm * scale
    const x1 = glyph.x1 * glyph.scaleX * scale + originX + glyphOffsetX
    const y1 = glyph.y1 * glyph.scaleY * scale + glyphOffsetY
    const x2 = glyph.x2 * glyph.scaleX * scale + originX + glyphOffsetX
    const y2 = glyph.y2 * glyph.scaleY * scale + glyphOffsetY
    const autoConnectY =
      (glyph.connectY * glyph.scaleY + glyph.connectYAdjustRefMm) * scale + glyphOffsetY
    const leftConnectX =
      glyph.leftConnectXRefMm === null
        ? x1
        : glyph.leftConnectXRefMm * glyph.scaleX * scale + originX + glyphOffsetX
    const leftConnectY =
      glyph.leftConnectYRefMm === null
        ? autoConnectY
        : glyph.leftConnectYRefMm * glyph.scaleY * scale + glyphOffsetY
    const rightConnectX =
      glyph.rightConnectXRefMm === null
        ? x2
        : glyph.rightConnectXRefMm * glyph.scaleX * scale + originX + glyphOffsetX
    const rightConnectY =
      glyph.rightConnectYRefMm === null
        ? autoConnectY
        : glyph.rightConnectYRefMm * glyph.scaleY * scale + glyphOffsetY

    const pathData = svgpath(glyph.pathData)
      .scale(scale * glyph.scaleX, scale * glyph.scaleY)
      .translate(originX + glyphOffsetX, glyphOffsetY)
      .round(3)
      .toString()

    return [
      {
        char,
        pathData,
        x1,
        y1,
        x2,
        y2,
        width: x2 - x1,
        height: y2 - y1,
        leftConnectX,
        leftConnectY,
        rightConnectX,
        rightConnectY,
      },
    ]
  })
}

function bridgeBetween(scope: paper.PaperScope, left: GlyphShape, right: GlyphShape, thickness: number) {
  const leftAnchor = new scope.Point(left.rightConnectX, left.rightConnectY)
  const rightAnchor = new scope.Point(right.leftConnectX, right.leftConnectY)
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

function buildDebugAnchors(shapes: GlyphShape[]): GlyphDebugAnchor[] {
  if (shapes.length === 0) {
    return []
  }

  const bounds = shapes.reduce(
    (accumulator, glyph) => ({
      x1: Math.min(accumulator.x1, glyph.x1),
      y1: Math.min(accumulator.y1, glyph.y1),
    }),
    {
      x1: Number.POSITIVE_INFINITY,
      y1: Number.POSITIVE_INFINITY,
    },
  )

  return shapes.flatMap((glyph) => [
    {
      char: glyph.char,
      side: 'left',
      xMm: glyph.leftConnectX - bounds.x1,
      yMm: glyph.leftConnectY - bounds.y1,
    },
    {
      char: glyph.char,
      side: 'right',
      xMm: glyph.rightConnectX - bounds.x1,
      yMm: glyph.rightConnectY - bounds.y1,
    },
  ])
}

export function renderWord(
  item: InputItem,
  glyphMap: GlyphMap,
  settings: TextRenderSettings,
): RenderedWord | null {
  const cacheKey = getCacheKey(item, settings, glyphMap.version)
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
    debugAnchors: buildDebugAnchors(glyphShapes),
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
