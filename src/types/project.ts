export type LetterlinkAccentPart = {
  id: string
  label: string
  pathData: string
  xOffsetRefMm: number
  yOffsetRefMm: number
}

export type LetterlinkGlyph = {
  char: string
  codePoint: number
  advance: number
  connectY: number
  basePathData: string
  xOffsetRefMm: number
  yOffsetRefMm: number
  advanceAdjustRefMm: number
  connectYAdjustRefMm: number
  leftConnectXRefMm: number | null
  leftConnectYRefMm: number | null
  rightConnectXRefMm: number | null
  rightConnectYRefMm: number | null
  scaleX: number
  scaleY: number
  accentParts: LetterlinkAccentPart[]
}

export type LetterlinkProjectSource = {
  kind: 'font'
  fileName: string
  fontFamily: string
  unitsPerEm: number
}

export type LetterlinkProject = {
  fileType: 'letterlink-project'
  version: 1
  refSize: number
  baseline: number
  createdAt: string
  updatedAt: string
  source: LetterlinkProjectSource
  glyphs: LetterlinkGlyph[]
}

export type ProjectFileEnvelope = {
  fileType: 'letterlink-project'
  version: 1
  project: LetterlinkProject
}
