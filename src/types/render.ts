export type InputItem = {
  id: string
  name: string
  sourceIndex: number
}

export type TextRenderSettings = {
  fontSizeMm: number
  spacingMm: number
  bridgeThicknessMm: number
  bridgeShape: 'rectangle' | 'oval' | 'pinched'
  strokeWidthMm: number
  renderMode: 'fill' | 'stroke'
}

export type BoardSettings = {
  widthMm: number
  heightMm: number
  marginMm: number
  horizontalGapMm: number
  verticalGapMm: number
}

export type GlyphDebugAnchor = {
  char: string
  side: 'left' | 'right'
  xMm: number
  yMm: number
}

export type RenderedWord = {
  id: string
  name: string
  pathData: string
  widthMm: number
  heightMm: number
  debugAnchors?: GlyphDebugAnchor[]
}

export type PlacedItem = RenderedWord & {
  pageIndex: number
  xMm: number
  yMm: number
}

export type BoardPage = {
  index: number
  widthMm: number
  heightMm: number
  items: PlacedItem[]
}
