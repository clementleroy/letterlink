import { useEffect, useRef } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../lib/glyph-geometry'
import type { AppStrings, LetterlinkGlyph } from '../../types'
import styles from './components/GlyphEditorPanel.module.css'
import { AccentControlsGroup } from './components/AccentControlsGroup'
import { AnchorControlsGroup } from './components/AnchorControlsGroup'
import { GlyphEditorCanvas } from './components/GlyphEditorCanvas'
import { GlyphEditorHeader } from './components/GlyphEditorHeader'
import { GlyphInfoBar } from './components/GlyphInfoBar'
import { LetterNavigationGroup } from './components/LetterNavigationGroup'

type GlyphEditorPanelProps = {
  activeAnchorSide: 'left' | 'right'
  availableGlyphChars: string[]
  canSelectNextGlyph: boolean
  canSelectPreviousGlyph: boolean
  glyphEditorAnchors: GlyphAnchorPositions | null
  glyphEditorLayers: GlyphEditorLayer[]
  glyphEditorLayout: GlyphEditorLayout | null
  strings: AppStrings
  safeSelectedAccentId: string | null
  safeSelectedGlyphChar: string
  selectedAccent: LetterlinkGlyph['accentParts'][number] | null
  selectedGlyph: LetterlinkGlyph | null
  selectedGlyphData: ProjectGlyphData | null
  onAccentPointerDown: (event: PointerEvent<SVGPathElement>, accentId: string) => void
  onGlyphCanvasClick: (event: MouseEvent<SVGSVGElement>) => void
  onGlyphCanvasPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onNudgeSelectedAccent: (deltaX: number, deltaY: number) => void
  onOpenConfigurator: () => void
  onResetSelectedAccent: () => void
  onResetSelectedAnchor: (side: 'left' | 'right') => void
  onSetActiveAnchorSide: (side: 'left' | 'right') => void
  onSetSelectedGlyphChar: (value: string) => void
  onSelectNextGlyph: () => void
  onSelectPreviousGlyph: () => void
  onAnchorPointerDown: (event: PointerEvent<SVGGElement>, side: 'left' | 'right') => void
  onStopAccentDrag: () => void
}

export function GlyphEditorPanel({
  activeAnchorSide,
  availableGlyphChars,
  canSelectNextGlyph,
  canSelectPreviousGlyph,
  glyphEditorAnchors,
  glyphEditorLayers,
  glyphEditorLayout,
  strings,
  safeSelectedAccentId,
  safeSelectedGlyphChar,
  selectedAccent,
  selectedGlyph,
  selectedGlyphData,
  onAccentPointerDown,
  onGlyphCanvasClick,
  onGlyphCanvasPointerMove,
  onNudgeSelectedAccent,
  onOpenConfigurator,
  onResetSelectedAccent,
  onResetSelectedAnchor,
  onSetActiveAnchorSide,
  onSetSelectedGlyphChar,
  onSelectNextGlyph,
  onSelectPreviousGlyph,
  onAnchorPointerDown,
  onStopAccentDrag,
}: GlyphEditorPanelProps) {
  const canEditAccents = Boolean(selectedGlyph?.accentParts.length)
  const holdTimeoutRef = useRef<number | null>(null)
  const holdIntervalRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  const stopNudgeRepeat = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }

    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
  }

  const triggerNudge = (deltaX: number, deltaY: number) => {
    if (!canEditAccents) {
      return
    }

    onNudgeSelectedAccent(deltaX, deltaY)
  }

  const startNudgeRepeat = (
    event: PointerEvent<HTMLButtonElement>,
    deltaX: number,
    deltaY: number,
  ) => {
    if (!canEditAccents) {
      return
    }

    suppressClickRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    triggerNudge(deltaX, deltaY)
    stopNudgeRepeat()
    holdTimeoutRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        triggerNudge(deltaX, deltaY)
      }, 55)
    }, 220)
  }

  useEffect(() => stopNudgeRepeat, [])

  const nudgeDirections = [
    { direction: 'up', dx: 0, dy: -0.5, symbol: '↑', title: strings.prepare.moveAccentUp },
    { direction: 'left', dx: -0.5, dy: 0, symbol: '←', title: strings.prepare.moveAccentLeft },
    { direction: 'down', dx: 0, dy: 0.5, symbol: '↓', title: strings.prepare.moveAccentDown },
    { direction: 'right', dx: 0.5, dy: 0, symbol: '→', title: strings.prepare.moveAccentRight },
  ] as const

  const accentName = canEditAccents
    ? (selectedGlyph?.accentParts.find((accent) => accent.id === safeSelectedAccentId)?.label ??
       selectedGlyph?.accentParts[0]?.label ??
       strings.prepare.accentPiece)
    : strings.prepare.noAccentPieceDetected

  return (
    <section className={styles.panel}>
      <GlyphEditorHeader
        ctaLabel={strings.prepare.fontReadyCta}
        editorCopy={strings.prepare.editorCopy}
        editorTitle={strings.prepare.editorTitle}
        onOpenConfigurator={onOpenConfigurator}
        readyBanner={selectedGlyph ? strings.prepare.fontReadyBanner : null}
      />

      <div className={styles.toolbar}>
        <LetterNavigationGroup
          availableGlyphChars={availableGlyphChars}
          canSelectNextGlyph={canSelectNextGlyph}
          canSelectPreviousGlyph={canSelectPreviousGlyph}
          label={strings.prepare.letter}
          nextLabel={strings.prepare.nextLetter}
          previousLabel={strings.prepare.previousLetter}
          selectedGlyph={selectedGlyph}
          selectedGlyphChar={safeSelectedGlyphChar}
          spaceLabel={strings.prepare.space}
          onSelectGlyphChar={onSetSelectedGlyphChar}
          onSelectNextGlyph={onSelectNextGlyph}
          onSelectPreviousGlyph={onSelectPreviousGlyph}
        />

        <AnchorControlsGroup
          activeAnchorSide={activeAnchorSide}
          connectionPointLabel={strings.prepare.connectionPoint}
          endLabel={strings.prepare.end}
          resetLabel={strings.prepare.resetPoint}
          startLabel={strings.prepare.start}
          onResetSelectedAnchor={onResetSelectedAnchor}
          onSetActiveAnchorSide={onSetActiveAnchorSide}
        />

        <AccentControlsGroup
          accentLabel={strings.prepare.accentPiece}
          accentName={accentName}
          canEditAccents={canEditAccents}
          directions={nudgeDirections}
          onNudge={triggerNudge}
          onResetSelectedAccent={onResetSelectedAccent}
          onStartNudgeRepeat={startNudgeRepeat}
          onStopNudgeRepeat={stopNudgeRepeat}
          resetLabel={strings.prepare.resetAccent}
          suppressClickRef={suppressClickRef}
        />
      </div>

      <GlyphEditorCanvas
        activeAnchorSide={activeAnchorSide}
        canEditAccents={canEditAccents}
        emptyCopy={strings.prepare.emptyCopy}
        emptyTitle={strings.prepare.emptyTitle}
        glyphEditorAnchors={glyphEditorAnchors}
        glyphEditorLayers={glyphEditorLayers}
        glyphEditorLayout={glyphEditorLayout}
        selectedAccentId={safeSelectedAccentId}
        selectedGlyphChar={safeSelectedGlyphChar}
        selectedGlyphData={selectedGlyphData}
        strings={strings}
        onAccentPointerDown={onAccentPointerDown}
        onAnchorPointerDown={onAnchorPointerDown}
        onGlyphCanvasClick={onGlyphCanvasClick}
        onGlyphCanvasPointerMove={onGlyphCanvasPointerMove}
        onNudgeSelectedAccent={onNudgeSelectedAccent}
        onStopAccentDrag={onStopAccentDrag}
      />

      <GlyphInfoBar
        accentOffsetLabel={strings.prepare.accentOffset}
        endPointLabel={strings.prepare.endPoint}
        notSetLabel={strings.prepare.notSet}
        selectedAccent={selectedAccent}
        selectedGlyph={selectedGlyph}
        startPointLabel={strings.prepare.startPoint}
      />
    </section>
  )
}
