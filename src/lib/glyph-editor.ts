import type { LetterlinkAccentPart } from '../types'
import type { Point, ProjectGlyphData } from './glyph-geometry'
import { roundRefValue } from './glyph-geometry'

export function clampEditorSelectionToGlyph(glyph: ProjectGlyphData, point: Point): Point {
  return {
    x: Math.min(Math.max(point.x, glyph.x1), glyph.x2),
    y: Math.min(Math.max(point.y, glyph.y1), glyph.y2),
  }
}

export function updateAccentOffset(
  accentParts: LetterlinkAccentPart[],
  accentId: string,
  deltaX: number,
  deltaY: number,
): LetterlinkAccentPart[] {
  return accentParts.map((accent) =>
    accent.id === accentId
      ? {
          ...accent,
          xOffsetRefMm: roundRefValue(accent.xOffsetRefMm + deltaX),
          yOffsetRefMm: roundRefValue(accent.yOffsetRefMm + deltaY),
        }
      : accent,
  )
}
