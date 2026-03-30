import { useMemo, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import type { AppFeedback } from '../lib/i18n'
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

type DragState =
  | {
      kind: 'accent'
      startX: number
      startY: number
      accentId: string
      pointerId: number
    }
  | {
      kind: 'anchor'
      side: AnchorSide
      pointerId: number
    }

export type UseGlyphEditorStateResult = {
  activeAnchorSide: AnchorSide
  availableGlyphChars: string[]
  canEditAccents: boolean
  canSelectNextGlyph: boolean
  canSelectPreviousGlyph: boolean
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
  selectNextGlyph: () => void
  selectPreviousGlyph: () => void
  ensureSelectedGlyph: () => void
  onGlyphCanvasClick: (
    event: MouseEvent<SVGSVGElement>,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
    ) => void,
  ) => void
  onAccentPointerDown: (event: PointerEvent<SVGPathElement>, accentId: string) => void
  onAnchorPointerDown: (event: PointerEvent<SVGGElement>, side: AnchorSide) => void
  stopAccentDrag: () => void
  onGlyphCanvasPointerMove: (
    event: PointerEvent<SVGSVGElement>,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
    ) => void,
  ) => void
  resetSelectedAnchor: (
    side: AnchorSide,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
    ) => void,
  ) => void
  resetSelectedAccent: (
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
    ) => void,
  ) => void
  nudgeSelectedAccent: (
    deltaX: number,
    deltaY: number,
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
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
  const suppressCanvasClickRef = useRef(false)

  const availableGlyphChars = useMemo(
    () => (project ? getAvailableGlyphChars(project) : []),
    [project],
  )

  const safeSelectedGlyphChar =
    availableGlyphChars.includes(selectedGlyphChar)
      ? selectedGlyphChar
      : (availableGlyphChars[0] ?? '')
  const selectedGlyphIndex = availableGlyphChars.indexOf(safeSelectedGlyphChar)

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
    () => (selectedGlyphData ? createGlyphEditorLayout(selectedGlyphData, 640, 420, 28) : null),
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

  const selectPreviousGlyph = () => {
    if (selectedGlyphIndex <= 0) {
      return
    }

    setSelectedGlyphChar(availableGlyphChars[selectedGlyphIndex - 1])
  }

  const selectNextGlyph = () => {
    if (selectedGlyphIndex < 0 || selectedGlyphIndex >= availableGlyphChars.length - 1) {
      return
    }

    setSelectedGlyphChar(availableGlyphChars[selectedGlyphIndex + 1])
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
        { key: 'editor.anchorReset', side: 'left' },
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
      { key: 'editor.anchorReset', side: 'right' },
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
      { key: 'editor.accentOffsetReset' },
    )
  }

  const getClampedCanvasPoint = (
    event: MouseEvent<SVGSVGElement> | PointerEvent<SVGSVGElement>,
  ) => {
    if (!selectedGlyphData || !glyphEditorLayout) {
      return null
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - rect.left) / rect.width) * glyphEditorLayout.width
    const svgY = ((event.clientY - rect.top) / rect.height) * glyphEditorLayout.height
    const visualX = (svgX - glyphEditorLayout.offsetX) / glyphEditorLayout.scale
    const visualY = (svgY - glyphEditorLayout.offsetY) / glyphEditorLayout.scale
    const rawX = (visualX - selectedGlyphData.xOffsetRefMm) / selectedGlyphData.scaleX
    const rawY = (visualY - selectedGlyphData.yOffsetRefMm) / selectedGlyphData.scaleY

    return clampEditorSelectionToGlyph(selectedGlyphData, {
      x: rawX,
      y: rawY,
    })
  }

  const updateAnchorPosition = (
    side: AnchorSide,
    point: { x: number; y: number },
    updateGlyph: (
      glyphChar: string,
      mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
      message?: AppFeedback,
    ) => void,
    message?: AppFeedback,
  ) => {
    if (!selectedGlyph) {
      return
    }

    if (side === 'left') {
      updateGlyph(
        selectedGlyph.char,
        (glyph) => ({
          ...glyph,
          leftConnectXRefMm: roundRefValue(point.x),
          leftConnectYRefMm: roundRefValue(point.y),
        }),
        message,
      )
      return
    }

    updateGlyph(
      selectedGlyph.char,
      (glyph) => ({
        ...glyph,
        rightConnectXRefMm: roundRefValue(point.x),
        rightConnectYRefMm: roundRefValue(point.y),
      }),
      message,
    )
  }

  const onGlyphCanvasClick: UseGlyphEditorStateResult['onGlyphCanvasClick'] = (
    event,
    updateGlyph,
  ) => {
    if (!selectedGlyph || !selectedGlyphData || !glyphEditorLayout) {
      return
    }

    if (suppressCanvasClickRef.current) {
      suppressCanvasClickRef.current = false
      return
    }

    if (dragState?.kind === 'anchor') {
      return
    }

    const clampedPoint = getClampedCanvasPoint(event)
    if (!clampedPoint) {
      return
    }

    updateAnchorPosition(
      activeAnchorSide,
      clampedPoint,
      updateGlyph,
      { key: 'editor.anchorUpdated', side: activeAnchorSide, glyphChar: safeSelectedGlyphChar },
    )
  }

  const onAccentPointerDown = (event: PointerEvent<SVGPathElement>, accentId: string) => {
    event.stopPropagation()
    suppressCanvasClickRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedAccentId(accentId)
    setDragState({
      kind: 'accent',
      startX: event.clientX,
      startY: event.clientY,
      accentId,
      pointerId: event.pointerId,
    })
  }

  const onAnchorPointerDown: UseGlyphEditorStateResult['onAnchorPointerDown'] = (event, side) => {
    event.stopPropagation()
    suppressCanvasClickRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveAnchorSide(side)
    setDragState({
      kind: 'anchor',
      side,
      pointerId: event.pointerId,
    })
  }

  const stopAccentDrag = () => {
    if (!dragState) {
      return
    }

    setDragState(null)
  }

  const onGlyphCanvasPointerMove: UseGlyphEditorStateResult['onGlyphCanvasPointerMove'] = (
    event,
    updateGlyph,
  ) => {
    if (!selectedGlyph || !selectedGlyphData || !glyphEditorLayout || !dragState) {
      return
    }

    if (event.pointerId !== dragState.pointerId) {
      return
    }

    if (dragState.kind === 'anchor') {
      const clampedPoint = getClampedCanvasPoint(event)
      if (!clampedPoint) {
        return
      }

      updateAnchorPosition(dragState.side, clampedPoint, updateGlyph)
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
      kind: 'accent',
      startX: event.clientX,
      startY: event.clientY,
      accentId: dragState.accentId,
      pointerId: dragState.pointerId,
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
      { key: 'editor.accentPositionUpdated' },
    )
  }

  return {
    activeAnchorSide,
    availableGlyphChars,
    canEditAccents: Boolean(selectedGlyph?.accentParts.length),
    canSelectNextGlyph: selectedGlyphIndex >= 0 && selectedGlyphIndex < availableGlyphChars.length - 1,
    canSelectPreviousGlyph: selectedGlyphIndex > 0,
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
    selectNextGlyph,
    selectPreviousGlyph,
    ensureSelectedGlyph,
    onGlyphCanvasClick,
    onAccentPointerDown,
    onAnchorPointerDown,
    stopAccentDrag,
    onGlyphCanvasPointerMove,
    resetSelectedAnchor,
    resetSelectedAccent,
    nudgeSelectedAccent,
  }
}
