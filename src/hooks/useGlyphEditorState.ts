import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  clampEditorSelectionToGlyph,
  updateAccentOffset,
} from '../lib/glyph-editor'
import {
  createGlyphEditorLayout,
  getAvailableGlyphChars,
  getGlyphAnchorPositions,
  getGlyphEditorLayers,
  roundRefValue,
  type ProjectGlyphData,
} from '../lib/glyph-geometry'
import type { GlyphMap } from '../lib/glyphs'
import type { LetterlinkGlyph, LetterlinkProject } from '../types'

type AnchorSide = 'left' | 'right'

type DragState = {
  startX: number
  startY: number
  accentId: string
}

export type UseGlyphEditorStateResult = {
  activeAnchorSide: AnchorSide
  availableGlyphChars: string[]
  canEditAccents: boolean
  glyphEditorAnchors: ReturnType<typeof getGlyphAnchorPositions> | null
  glyphEditorLayers: ReturnType<typeof getGlyphEditorLayers>
  glyphEditorLayout: ReturnType<typeof createGlyphEditorLayout> | null
  safeSelectedAccentId: string | null
  safeSelectedGlyphChar: string
  selectedAccent: LetterlinkGlyph['accentParts'][number] | null
  selectedGlyph: LetterlinkGlyph | null
  selectedGlyphData: ProjectGlyphData | null
  setActiveAnchorSide: (side: AnchorSide) => void
  setSelectedGlyphChar: (value: string) => void
  setSelectedAccentId: (value: string | null) => void
  ensureSelectedGlyph: () => void
  onGlyphCanvasClick: (
    event: MouseEvent<SVGSVGElement>,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: string,
    ) => void,
  ) => void
  onAccentMouseDown: (event: MouseEvent<SVGPathElement>, accentId: string) => void
  stopAccentDrag: () => void
  onGlyphCanvasMouseMove: (
    event: MouseEvent<SVGSVGElement>,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: string,
    ) => void,
  ) => void
  resetSelectedAnchor: (
    side: AnchorSide,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: string,
    ) => void,
  ) => void
  resetSelectedAccent: (
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: string,
    ) => void,
  ) => void
  nudgeSelectedAccent: (
    deltaX: number,
    deltaY: number,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: string,
    ) => void,
  ) => void
}

export function useGlyphEditorState(
  project: LetterlinkProject | null,
  glyphMap: GlyphMap | null,
): UseGlyphEditorStateResult {
  const [selectedGlyphChar, setSelectedGlyphChar] = useState('a')
  const [activeAnchorSide, setActiveAnchorSide] = useState<AnchorSide>('left')
  const [selectedAccentId, setSelectedAccentId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const availableGlyphChars = useMemo(
    () => (project ? getAvailableGlyphChars(project) : []),
    [project],
  )

  const safeSelectedGlyphChar =
    availableGlyphChars.includes(selectedGlyphChar)
      ? selectedGlyphChar
      : (availableGlyphChars[0] ?? '')

  const selectedGlyph = useMemo<LetterlinkGlyph | null>(() => {
    if (!project) {
      return null
    }

    return project.glyphs.find((glyph) => glyph.char === safeSelectedGlyphChar) ?? null
  }, [project, safeSelectedGlyphChar])

  const selectedGlyphData = useMemo(() => {
    const codePoint = safeSelectedGlyphChar.codePointAt(0)

    if (!glyphMap || codePoint === undefined) {
      return null
    }

    return glyphMap.glyphs.get(codePoint) ?? null
  }, [glyphMap, safeSelectedGlyphChar])

  const glyphEditorLayout = useMemo(
    () => (selectedGlyphData ? createGlyphEditorLayout(selectedGlyphData, 760, 520, 36) : null),
    [selectedGlyphData],
  )

  const glyphEditorAnchors = useMemo(
    () => (selectedGlyphData ? getGlyphAnchorPositions(selectedGlyphData) : null),
    [selectedGlyphData],
  )

  const glyphEditorLayers = useMemo(
    () => (selectedGlyph ? getGlyphEditorLayers(selectedGlyph) : []),
    [selectedGlyph],
  )

  const selectedAccent =
    selectedGlyph?.accentParts.find((accent) => accent.id === selectedAccentId) ??
    selectedGlyph?.accentParts[0] ??
    null

  const safeSelectedAccentId = selectedAccent?.id ?? null

  const ensureSelectedGlyph = () => {
    setSelectedGlyphChar((previous) => previous || availableGlyphChars[0] || 'a')
  }

  const resetSelectedAnchor: UseGlyphEditorStateResult['resetSelectedAnchor'] = (
    side,
    updateGlyph,
  ) => {
    if (!selectedGlyph) {
      return
    }

    if (side === 'left') {
      updateGlyph(
        selectedGlyph.char,
        (glyph) => ({
          ...glyph,
          leftConnectXRefMm: null,
          leftConnectYRefMm: null,
        }),
        'Entry anchor reset to automatic placement.',
      )
      return
    }

    updateGlyph(
      selectedGlyph.char,
      (glyph) => ({
        ...glyph,
        rightConnectXRefMm: null,
        rightConnectYRefMm: null,
      }),
      'Exit anchor reset to automatic placement.',
    )
  }

  const resetSelectedAccent: UseGlyphEditorStateResult['resetSelectedAccent'] = (updateGlyph) => {
    if (!selectedGlyph || !safeSelectedAccentId) {
      return
    }

    updateGlyph(
      selectedGlyph.char,
      (glyph) => ({
        ...glyph,
        accentParts: glyph.accentParts.map((accent) =>
          accent.id === safeSelectedAccentId
            ? { ...accent, xOffsetRefMm: 0, yOffsetRefMm: 0 }
            : accent,
        ),
      }),
      'Accent offset reset.',
    )
  }

  const onGlyphCanvasClick: UseGlyphEditorStateResult['onGlyphCanvasClick'] = (
    event,
    updateGlyph,
  ) => {
    if (!selectedGlyph || !selectedGlyphData || !glyphEditorLayout) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - rect.left) / rect.width) * glyphEditorLayout.width
    const svgY = ((event.clientY - rect.top) / rect.height) * glyphEditorLayout.height
    const visualX = (svgX - glyphEditorLayout.offsetX) / glyphEditorLayout.scale
    const visualY = (svgY - glyphEditorLayout.offsetY) / glyphEditorLayout.scale
    const rawX = (visualX - selectedGlyphData.xOffsetRefMm) / selectedGlyphData.scaleX
    const rawY = (visualY - selectedGlyphData.yOffsetRefMm) / selectedGlyphData.scaleY
    const clampedPoint = clampEditorSelectionToGlyph(selectedGlyphData, {
      x: rawX,
      y: rawY,
    })

    if (activeAnchorSide === 'left') {
      updateGlyph(
        selectedGlyph.char,
        (glyph) => ({
          ...glyph,
          leftConnectXRefMm: roundRefValue(clampedPoint.x),
          leftConnectYRefMm: roundRefValue(clampedPoint.y),
        }),
        `Entry anchor updated for "${safeSelectedGlyphChar}".`,
      )
      return
    }

    updateGlyph(
      selectedGlyph.char,
      (glyph) => ({
        ...glyph,
        rightConnectXRefMm: roundRefValue(clampedPoint.x),
        rightConnectYRefMm: roundRefValue(clampedPoint.y),
      }),
      `Exit anchor updated for "${safeSelectedGlyphChar}".`,
    )
  }

  const onAccentMouseDown = (event: MouseEvent<SVGPathElement>, accentId: string) => {
    event.stopPropagation()
    setSelectedAccentId(accentId)
    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      accentId,
    })
  }

  const stopAccentDrag = () => {
    if (!dragState) {
      return
    }

    setDragState(null)
  }

  const onGlyphCanvasMouseMove: UseGlyphEditorStateResult['onGlyphCanvasMouseMove'] = (
    event,
    updateGlyph,
  ) => {
    if (!selectedGlyph || !selectedGlyphData || !glyphEditorLayout || !dragState) {
      return
    }

    const deltaSvgX =
      ((event.clientX - dragState.startX) / event.currentTarget.getBoundingClientRect().width) *
      glyphEditorLayout.width
    const deltaSvgY =
      ((event.clientY - dragState.startY) / event.currentTarget.getBoundingClientRect().height) *
      glyphEditorLayout.height
    const deltaVisualX = deltaSvgX / glyphEditorLayout.scale
    const deltaVisualY = deltaSvgY / glyphEditorLayout.scale
    const deltaRawX = deltaVisualX / selectedGlyphData.scaleX
    const deltaRawY = deltaVisualY / selectedGlyphData.scaleY

    updateGlyph(selectedGlyph.char, (glyph) => ({
      ...glyph,
      accentParts: updateAccentOffset(
        glyph.accentParts,
        dragState.accentId,
        deltaRawX,
        deltaRawY,
      ),
    }))

    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      accentId: dragState.accentId,
    })
  }

  const nudgeSelectedAccent: UseGlyphEditorStateResult['nudgeSelectedAccent'] = (
    deltaX,
    deltaY,
    updateGlyph,
  ) => {
    if (!selectedGlyph || !safeSelectedAccentId) {
      return
    }

    updateGlyph(
      selectedGlyph.char,
      (glyph) => ({
        ...glyph,
        accentParts: updateAccentOffset(glyph.accentParts, safeSelectedAccentId, deltaX, deltaY),
      }),
      'Accent position updated.',
    )
  }

  return {
    activeAnchorSide,
    availableGlyphChars,
    canEditAccents: Boolean(selectedGlyph?.accentParts.length),
    glyphEditorAnchors,
    glyphEditorLayers,
    glyphEditorLayout,
    safeSelectedAccentId,
    safeSelectedGlyphChar,
    selectedAccent,
    selectedGlyph,
    selectedGlyphData,
    setActiveAnchorSide,
    setSelectedGlyphChar,
    setSelectedAccentId,
    ensureSelectedGlyph,
    onGlyphCanvasClick,
    onAccentMouseDown,
    stopAccentDrag,
    onGlyphCanvasMouseMove,
    resetSelectedAnchor,
    resetSelectedAccent,
    nudgeSelectedAccent,
  }
}
