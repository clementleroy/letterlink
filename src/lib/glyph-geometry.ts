import paper from 'paper'
import svgpath from 'svgpath'
import type { LetterlinkGlyph, LetterlinkProject } from '../types'

const scope = new paper.PaperScope()
scope.setup(new scope.Size(1024, 1024))

export type Point = {
  x: number
  y: number
}

export type GlyphAnchorPositions = {
  left: Point
  right: Point
}

export type GlyphVisualBounds = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type GlyphEditorLayout = {
  width: number
  height: number
  padding: number
  scale: number
  offsetX: number
  offsetY: number
}

export type GlyphEditorLayer = {
  id: string
  label: string
  kind: 'base' | 'accent' | 'bridge'
  pathData: string
  center: Point
  area: number
}

type ContourGeometry = {
  pathData: string
  center: Point
  area: number
  bounds: GlyphVisualBounds
}

export type ProjectGlyphData = LetterlinkGlyph & {
  pathData: string
  x1: number
  y1: number
  x2: number
  y2: number
}

function withPaperProject<T>(run: () => T): T {
  try {
    scope.project.clear()
    return run()
  } finally {
    scope.project.clear()
  }
}

function emptyBounds(): GlyphVisualBounds {
  return {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  }
}

function reduceBoundsFromContours(contours: ContourGeometry[]): GlyphVisualBounds {
  if (contours.length === 0) {
    return emptyBounds()
  }

  return contours.reduce<GlyphVisualBounds>(
    (accumulator, contour) => ({
      x1: Math.min(accumulator.x1, contour.bounds.x1),
      y1: Math.min(accumulator.y1, contour.bounds.y1),
      x2: Math.max(accumulator.x2, contour.bounds.x2),
      y2: Math.max(accumulator.y2, contour.bounds.y2),
    }),
    {
      x1: Number.POSITIVE_INFINITY,
      y1: Number.POSITIVE_INFINITY,
      x2: Number.NEGATIVE_INFINITY,
      y2: Number.NEGATIVE_INFINITY,
    },
  )
}

export function roundRefValue(value: number) {
  return Number(value.toFixed(2))
}

export function splitPathContours(pathData: string): ContourGeometry[] {
  if (!pathData.trim()) {
    return []
  }

  return withPaperProject(() => {
    const compoundPath = new scope.CompoundPath(pathData)
    const children = compoundPath.children.length > 0 ? compoundPath.children : [compoundPath]

    return children.map((child) => {
      const clone = child.clone({ insert: false }) as paper.PathItem
      const bounds = clone.bounds

      return {
        pathData: svgpath(clone.pathData).round(3).toString(),
        center: {
          x: bounds.center.x,
          y: bounds.center.y,
        },
        area: Math.abs(bounds.width * bounds.height),
        bounds: {
          x1: bounds.x,
          y1: bounds.y,
          x2: bounds.x + bounds.width,
          y2: bounds.y + bounds.height,
        },
      }
    })
  })
}

export function buildGlyphPathData(glyph: LetterlinkGlyph): string {
  const accentPaths = glyph.accentParts
    .map((accent) =>
      svgpath(accent.pathData)
        .translate(accent.xOffsetRefMm, accent.yOffsetRefMm)
        .round(3)
        .toString(),
    )
    .join('')

  return `${glyph.basePathData}${accentPaths}`
}

export function buildGlyphVisualBounds(glyph: LetterlinkGlyph): GlyphVisualBounds {
  return reduceBoundsFromContours(splitPathContours(buildGlyphPathData(glyph)))
}

export function materializeProjectGlyph(glyph: LetterlinkGlyph): ProjectGlyphData {
  const pathData = buildGlyphPathData(glyph)
  const bounds = buildGlyphVisualBounds(glyph)

  return {
    ...glyph,
    pathData,
    ...bounds,
  }
}

function materializeBaseGlyph(glyph: LetterlinkGlyph): ProjectGlyphData {
  const bounds = reduceBoundsFromContours(splitPathContours(glyph.basePathData))

  return {
    ...glyph,
    pathData: glyph.basePathData,
    ...bounds,
  }
}

export function getAvailableGlyphChars(project: LetterlinkProject): string[] {
  return project.glyphs.map((glyph) => glyph.char).sort((left, right) => left.localeCompare(right))
}

export function getGlyphVisualBounds(glyph: ProjectGlyphData): GlyphVisualBounds {
  return {
    x1: glyph.x1 * glyph.scaleX + glyph.xOffsetRefMm,
    y1: glyph.y1 * glyph.scaleY + glyph.yOffsetRefMm,
    x2: glyph.x2 * glyph.scaleX + glyph.xOffsetRefMm,
    y2: glyph.y2 * glyph.scaleY + glyph.yOffsetRefMm,
  }
}

export function getGlyphAnchorPositions(glyph: ProjectGlyphData): GlyphAnchorPositions {
  const bounds = getGlyphVisualBounds(glyph)
  const fallbackY = glyph.connectY * glyph.scaleY + glyph.connectYAdjustRefMm + glyph.yOffsetRefMm

  return {
    left: {
      x:
        glyph.leftConnectXRefMm === null
          ? bounds.x1
          : glyph.leftConnectXRefMm * glyph.scaleX + glyph.xOffsetRefMm,
      y:
        glyph.leftConnectYRefMm === null
          ? fallbackY
          : glyph.leftConnectYRefMm * glyph.scaleY + glyph.yOffsetRefMm,
    },
    right: {
      x:
        glyph.rightConnectXRefMm === null
          ? bounds.x2
          : glyph.rightConnectXRefMm * glyph.scaleX + glyph.xOffsetRefMm,
      y:
        glyph.rightConnectYRefMm === null
          ? fallbackY
          : glyph.rightConnectYRefMm * glyph.scaleY + glyph.yOffsetRefMm,
    },
  }
}

function getEditorBridgeLength(glyph: ProjectGlyphData) {
  const bounds = getGlyphVisualBounds(glyph)
  return Math.max((bounds.x2 - bounds.x1) * 0.18, 8)
}

function getEditorBridgeThickness(glyph: ProjectGlyphData) {
  const bounds = getGlyphVisualBounds(glyph)
  return Math.max((bounds.y2 - bounds.y1) * 0.045, 1.6)
}

function buildEditorBridgePath(
  start: Point,
  end: Point,
  thickness: number,
): string {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.max(Math.hypot(dx, dy), 0.001)
  const normalX = (-dy / length) * (thickness / 2)
  const normalY = (dx / length) * (thickness / 2)

  return [
    `M ${roundRefValue(start.x + normalX)} ${roundRefValue(start.y + normalY)}`,
    `L ${roundRefValue(end.x + normalX)} ${roundRefValue(end.y + normalY)}`,
    `L ${roundRefValue(end.x - normalX)} ${roundRefValue(end.y - normalY)}`,
    `L ${roundRefValue(start.x - normalX)} ${roundRefValue(start.y - normalY)}`,
    'Z',
  ].join(' ')
}

function getGlyphEditorPreviewBounds(glyph: ProjectGlyphData): GlyphVisualBounds {
  const bounds = getGlyphVisualBounds(glyph)
  const anchors = getGlyphAnchorPositions(glyph)
  const bridgeLength = getEditorBridgeLength(glyph)
  const bridgeThickness = getEditorBridgeThickness(glyph)
  const bridgeHalf = bridgeThickness / 2

  return {
    x1: Math.min(bounds.x1, anchors.left.x - bridgeLength, anchors.right.x) - bridgeHalf,
    y1: Math.min(bounds.y1, anchors.left.y, anchors.right.y) - bridgeHalf,
    x2: Math.max(bounds.x2, anchors.left.x, anchors.right.x + bridgeLength) + bridgeHalf,
    y2: Math.max(bounds.y2, anchors.left.y, anchors.right.y) + bridgeHalf,
  }
}

function buildLayer(
  id: string,
  label: string,
  kind: 'base' | 'accent' | 'bridge',
  pathData: string,
): GlyphEditorLayer | null {
  const contours = splitPathContours(pathData)

  if (contours.length === 0) {
    return null
  }

  const bounds = reduceBoundsFromContours(contours)

  return {
    id,
    label,
    kind,
    pathData,
    center: {
      x: (bounds.x1 + bounds.x2) / 2,
      y: (bounds.y1 + bounds.y2) / 2,
    },
    area: Math.abs((bounds.x2 - bounds.x1) * (bounds.y2 - bounds.y1)),
  }
}

export function getGlyphEditorLayers(glyph: LetterlinkGlyph): GlyphEditorLayer[] {
  const layers: GlyphEditorLayer[] = []
  const baseGlyph = materializeBaseGlyph(glyph)
  const anchors = getGlyphAnchorPositions(baseGlyph)
  const bridgeLength = getEditorBridgeLength(baseGlyph)
  const bridgeThickness = getEditorBridgeThickness(baseGlyph)
  const leftBridge = buildLayer(
    'bridge-left',
    'Entry bridge',
    'bridge',
    buildEditorBridgePath(
      { x: anchors.left.x - bridgeLength, y: anchors.left.y },
      anchors.left,
      bridgeThickness,
    ),
  )
  const rightBridge = buildLayer(
    'bridge-right',
    'Exit bridge',
    'bridge',
    buildEditorBridgePath(
      anchors.right,
      { x: anchors.right.x + bridgeLength, y: anchors.right.y },
      bridgeThickness,
    ),
  )

  if (leftBridge) {
    layers.push(leftBridge)
  }

  const baseLayer = buildLayer('base', 'Base letter', 'base', glyph.basePathData)

  if (baseLayer) {
    layers.push(baseLayer)
  }

  glyph.accentParts.forEach((accent) => {
    const shiftedPath = svgpath(accent.pathData)
      .translate(accent.xOffsetRefMm, accent.yOffsetRefMm)
      .round(3)
      .toString()
    const accentLayer = buildLayer(accent.id, accent.label, 'accent', shiftedPath)

    if (accentLayer) {
      layers.push(accentLayer)
    }
  })

  if (rightBridge) {
    layers.push(rightBridge)
  }

  return layers
}

export function createGlyphEditorLayout(
  glyph: ProjectGlyphData,
  width: number,
  height: number,
  padding: number,
): GlyphEditorLayout {
  const bounds = getGlyphEditorPreviewBounds(glyph)
  const glyphWidth = Math.max(1, bounds.x2 - bounds.x1)
  const glyphHeight = Math.max(1, bounds.y2 - bounds.y1)
  const scale = Math.min(
    (width - padding * 2) / glyphWidth,
    (height - padding * 2) / glyphHeight,
  )
  const offsetX =
    padding + (width - padding * 2 - glyphWidth * scale) / 2 - bounds.x1 * scale
  const offsetY =
    padding + (height - padding * 2 - glyphHeight * scale) / 2 - bounds.y1 * scale

  return {
    width,
    height,
    padding,
    scale,
    offsetX,
    offsetY,
  }
}
