export type InputItem = {
  id: string
  name: string
  sourceIndex: number
}

export type TextRenderSettings = {
  fontSizeMm: number
  overlapMm: number
  bridgeThicknessMm: number
  strokeWidthMm: number
  renderMode: 'fill' | 'stroke'
}

export type BoardSettings = {
  widthMm: number
  heightMm: number
  marginMm: number
  itemPaddingMm: number
  horizontalGapMm: number
  verticalGapMm: number
}

export type RenderedWord = {
  id: string
  name: string
  pathData: string
  widthMm: number
  heightMm: number
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
