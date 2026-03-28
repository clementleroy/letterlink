import type { BoardSettings, TextRenderSettings } from '../types'

export const DEFAULT_INPUT_TEXT = ['Élodie', 'Maëlys', 'Anaïs', 'João'].join('\n')

export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  widthMm: 300,
  heightMm: 200,
  marginMm: 12,
  itemPaddingMm: 6,
  horizontalGapMm: 8,
  verticalGapMm: 10,
}

export const DEFAULT_RENDER_SETTINGS: TextRenderSettings = {
  fontSizeMm: 28,
  letterSpacingMm: -0.6,
  overlapMm: 2.4,
  bridgeThicknessMm: 1.4,
  strokeWidthMm: 0.2,
  renderMode: 'fill',
}

