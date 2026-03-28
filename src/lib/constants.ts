import type { BoardSettings, TextRenderSettings } from '../types'

export const DEFAULT_INPUT_TEXT = ['Élodie', 'Maëlys', 'Anaïs', 'João'].join('\n')

export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  widthMm: 300,
  heightMm: 200,
  marginMm: 15,
  itemPaddingMm: 8,
  horizontalGapMm: 10,
  verticalGapMm: 12,
}

export const DEFAULT_RENDER_SETTINGS: TextRenderSettings = {
  fontSizeMm: 30,
  letterSpacingMm: -0.5,
  overlapMm: 3.0,
  bridgeThicknessMm: 1.8,
  strokeWidthMm: 0.1,
  renderMode: 'stroke',
}

