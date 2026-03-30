import { useEffect, useRef } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../lib/glyph-geometry'
import type { AppStrings, LetterlinkGlyph } from '../../types'

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

  const NUDGE_DIRECTIONS = [
    { className: 'nudge-up',    dx: 0,    dy: -0.5, symbol: '↑', title: strings.prepare.moveAccentUp    },
    { className: 'nudge-left',  dx: -0.5, dy: 0,    symbol: '←', title: strings.prepare.moveAccentLeft  },
    { className: 'nudge-down',  dx: 0,    dy: 0.5,  symbol: '↓', title: strings.prepare.moveAccentDown  },
    { className: 'nudge-right', dx: 0.5,  dy: 0,    symbol: '→', title: strings.prepare.moveAccentRight },
  ] as const

  const accentName = canEditAccents
    ? (selectedGlyph?.accentParts.find((a) => a.id === safeSelectedAccentId)?.label ??
       selectedGlyph?.accentParts[0]?.label ??
       strings.prepare.accentPiece)
    : strings.prepare.noAccentPieceDetected

  return (
    <section className="panel editor-panel">
      <div className="section-head">
        <div>
          <h2>{strings.prepare.editorTitle}</h2>
          <p className="panel-copy">{strings.prepare.editorCopy}</p>
        </div>
      </div>

      {selectedGlyph ? (
        <div className="editor-ready-banner">
          <span>{strings.prepare.fontReadyBanner}</span>
          <button className="banner-cta" onClick={onOpenConfigurator} type="button">
            {strings.prepare.fontReadyCta}
          </button>
        </div>
      ) : null}

      <div className="editor-toolbar">
        {/* Group 1: Letter navigation */}
        <div className="toolbar-group">
          <span className="toolbar-group-label">{strings.prepare.letter}</span>
          <div className="letter-nav-control">
            <button
              className="letter-nav-prev"
              disabled={!selectedGlyph || !canSelectPreviousGlyph}
              onClick={onSelectPreviousGlyph}
              type="button"
              aria-label={strings.prepare.previousLetter}
            >
              ‹
            </button>
            <select
              className="letter-nav-select"
              disabled={!selectedGlyph}
              onChange={(event) => onSetSelectedGlyphChar(event.target.value)}
              value={safeSelectedGlyphChar}
            >
              {availableGlyphChars.map((char) => (
                <option key={char} value={char}>
                  {char === ' ' ? strings.prepare.space : char}
                </option>
              ))}
            </select>
            <button
              className="letter-nav-next"
              disabled={!selectedGlyph || !canSelectNextGlyph}
              onClick={onSelectNextGlyph}
              type="button"
              aria-label={strings.prepare.nextLetter}
            >
              ›
            </button>
          </div>
        </div>

        {/* Group 2: Connection point */}
        <div className="toolbar-group">
          <span className="toolbar-group-label">{strings.prepare.connectionPoint}</span>
          <div className="toolbar-anchor-row">
            <div className="segmented segmented-compact">
              <button
                className={activeAnchorSide === 'left' ? 'active' : ''}
                onClick={() => onSetActiveAnchorSide('left')}
                type="button"
              >
                {strings.prepare.start}
              </button>
              <button
                className={activeAnchorSide === 'right' ? 'active' : ''}
                onClick={() => onSetActiveAnchorSide('right')}
                type="button"
              >
                {strings.prepare.end}
              </button>
            </div>
            <div className="button-row button-row-compact">
              <button
                onClick={() => onResetSelectedAnchor(activeAnchorSide)}
                type="button"
              >
                {strings.prepare.resetPoint}
              </button>
            </div>
          </div>
        </div>

        {/* Group 3: Accent + nudge dpad */}
        <div className={`toolbar-group toolbar-group-accent${!canEditAccents ? ' is-disabled' : ''}`}>
          <span className="toolbar-group-label">{strings.prepare.accentPiece}</span>
          <div className="toolbar-accent-row">
            <div className="accent-controls">
              <p className="accent-hint">{accentName}</p>
              <button
                className="button-row-compact"
                disabled={!canEditAccents}
                onClick={onResetSelectedAccent}
                type="button"
              >
                {strings.prepare.resetAccent}
              </button>
            </div>
            <div className="nudge-dpad">
              {NUDGE_DIRECTIONS.map(({ className, dx, dy, symbol, title }) => (
                <button
                  key={className}
                  className={className}
                  disabled={!canEditAccents}
                  onClick={(event) => {
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false
                      event.preventDefault()
                      return
                    }
                    triggerNudge(dx, dy)
                  }}
                  onPointerCancel={stopNudgeRepeat}
                  onPointerDown={(event) => startNudgeRepeat(event, dx, dy)}
                  onPointerLeave={stopNudgeRepeat}
                  onPointerUp={stopNudgeRepeat}
                  title={title}
                  type="button"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="editor-stage">
        {selectedGlyphData && glyphEditorLayout ? (
          <svg
            aria-label={strings.prepare.editorAriaLabel(safeSelectedGlyphChar)}
            className="glyph-editor-svg"
            onClick={onGlyphCanvasClick}
            onKeyDown={(event) => {
              if (!canEditAccents) return
              const nudgeMap: Record<string, [number, number]> = {
                ArrowLeft: [-0.5, 0],
                ArrowRight: [0.5, 0],
                ArrowUp: [0, -0.5],
                ArrowDown: [0, 0.5],
              }
              const delta = nudgeMap[event.key]
              if (delta) {
                event.preventDefault()
                onNudgeSelectedAccent(delta[0], delta[1])
              }
            }}
            onPointerCancel={onStopAccentDrag}
            onPointerLeave={onStopAccentDrag}
            onPointerMove={onGlyphCanvasPointerMove}
            onPointerUp={onStopAccentDrag}
            tabIndex={0}
            viewBox={`0 0 ${glyphEditorLayout.width} ${glyphEditorLayout.height}`}
          >
            <rect
              className="glyph-editor-background"
              height={glyphEditorLayout.height}
              rx="24"
              width={glyphEditorLayout.width}
            />
            <g
              transform={`translate(${glyphEditorLayout.offsetX} ${glyphEditorLayout.offsetY}) scale(${glyphEditorLayout.scale})`}
            >
              {glyphEditorLayers.map((layer) => (
                <path
                  key={layer.id}
                  className={`glyph-editor-path ${
                    layer.kind === 'accent'
                      ? 'is-accent'
                      : layer.kind === 'bridge'
                        ? 'is-bridge'
                        : 'is-base'
                  } ${safeSelectedAccentId === layer.id ? 'is-selected' : ''}`}
                  d={layer.pathData}
                  onPointerDown={
                    layer.kind === 'accent'
                      ? (event) => onAccentPointerDown(event, layer.id)
                      : undefined
                  }
                />
              ))}
              {glyphEditorAnchors ? (
                <>
                  <g
                    className={`editor-anchor ${activeAnchorSide === 'left' ? 'is-active' : ''}`}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => onAnchorPointerDown(event, 'left')}
                    transform={`translate(${glyphEditorAnchors.left.x} ${glyphEditorAnchors.left.y})`}
                  >
                    <circle r={activeAnchorSide === 'left' ? 3.6 : 2.6} />
                    <text x="5" y="-4">
                      {safeSelectedGlyphChar}:{strings.prepare.anchorInlineStart}
                    </text>
                  </g>
                  <g
                    className={`editor-anchor editor-anchor-right ${
                      activeAnchorSide === 'right' ? 'is-active' : ''
                    }`}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => onAnchorPointerDown(event, 'right')}
                    transform={`translate(${glyphEditorAnchors.right.x} ${glyphEditorAnchors.right.y})`}
                  >
                    <circle r={activeAnchorSide === 'right' ? 3.6 : 2.6} />
                    <text x="5" y="-4">
                      {safeSelectedGlyphChar}:{strings.prepare.anchorInlineEnd}
                    </text>
                  </g>
                </>
              ) : null}
            </g>
          </svg>
        ) : (
          <div className="empty-state">
            <h3>{strings.prepare.emptyTitle}</h3>
            <p>{strings.prepare.emptyCopy}</p>
          </div>
        )}
      </div>

      <div className="glyph-info-bar">
        <span className="info-bar-item">
          <span className="info-bar-label">{strings.prepare.startPoint}</span>
          <strong>
            {selectedGlyph?.leftConnectXRefMm ?? 'auto'} / {selectedGlyph?.leftConnectYRefMm ?? 'auto'} mm
          </strong>
        </span>
        <span className="info-bar-sep" aria-hidden="true" />
        <span className="info-bar-item">
          <span className="info-bar-label">{strings.prepare.endPoint}</span>
          <strong>
            {selectedGlyph?.rightConnectXRefMm ?? 'auto'} / {selectedGlyph?.rightConnectYRefMm ?? 'auto'} mm
          </strong>
        </span>
        <span className="info-bar-sep" aria-hidden="true" />
        <span className="info-bar-item">
          <span className="info-bar-label">{strings.prepare.accentOffset}</span>
          <strong>
            {selectedAccent
              ? `${selectedAccent.xOffsetRefMm} / ${selectedAccent.yOffsetRefMm} mm`
              : strings.prepare.notSet}
          </strong>
        </span>
      </div>

    </section>
  )
}
