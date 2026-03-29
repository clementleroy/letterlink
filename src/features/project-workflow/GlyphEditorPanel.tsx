import type { MouseEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../lib/glyph-geometry'
import type { LetterlinkGlyph } from '../../types'

type GlyphEditorPanelProps = {
  activeAnchorSide: 'left' | 'right'
  availableGlyphChars: string[]
  glyphEditorAnchors: GlyphAnchorPositions | null
  glyphEditorLayers: GlyphEditorLayer[]
  glyphEditorLayout: GlyphEditorLayout | null
  safeSelectedAccentId: string | null
  safeSelectedGlyphChar: string
  selectedAccent: LetterlinkGlyph['accentParts'][number] | null
  selectedGlyph: LetterlinkGlyph | null
  selectedGlyphData: ProjectGlyphData | null
  onAccentMouseDown: (event: MouseEvent<SVGPathElement>, accentId: string) => void
  onGlyphCanvasClick: (event: MouseEvent<SVGSVGElement>) => void
  onGlyphCanvasMouseMove: (event: MouseEvent<SVGSVGElement>) => void
  onNudgeSelectedAccent: (deltaX: number, deltaY: number) => void
  onResetSelectedAccent: () => void
  onResetSelectedAnchor: (side: 'left' | 'right') => void
  onSetActiveAnchorSide: (side: 'left' | 'right') => void
  onSetSelectedAccentId: (value: string | null) => void
  onSetSelectedGlyphChar: (value: string) => void
  onStopAccentDrag: () => void
}

export function GlyphEditorPanel({
  activeAnchorSide,
  availableGlyphChars,
  glyphEditorAnchors,
  glyphEditorLayers,
  glyphEditorLayout,
  safeSelectedAccentId,
  safeSelectedGlyphChar,
  selectedAccent,
  selectedGlyph,
  selectedGlyphData,
  onAccentMouseDown,
  onGlyphCanvasClick,
  onGlyphCanvasMouseMove,
  onNudgeSelectedAccent,
  onResetSelectedAccent,
  onResetSelectedAnchor,
  onSetActiveAnchorSide,
  onSetSelectedAccentId,
  onSetSelectedGlyphChar,
  onStopAccentDrag,
}: GlyphEditorPanelProps) {
  const canEditAccents = Boolean(selectedGlyph?.accentParts.length)

  return (
    <section className="panel editor-panel">
      <div className="section-head">
        <div>
          <h2>Glyph setup canvas</h2>
          <p className="panel-copy">
            Click anywhere on the glyph to place the active anchor. Drag the highlighted
            accent part to reposition it.
          </p>
        </div>
      </div>

      <div className="editor-toolbar">
        <label className="field">
          <span>Glyph</span>
          <select
            disabled={!selectedGlyph}
            onChange={(event) => onSetSelectedGlyphChar(event.target.value)}
            value={safeSelectedGlyphChar}
          >
            {availableGlyphChars.map((char) => (
              <option key={char} value={char}>
                {char === ' ' ? 'Space' : char}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>Active anchor</span>
          <div className="segmented">
            <button
              className={activeAnchorSide === 'left' ? 'active' : ''}
              onClick={() => onSetActiveAnchorSide('left')}
              type="button"
            >
              Entry
            </button>
            <button
              className={activeAnchorSide === 'right' ? 'active' : ''}
              onClick={() => onSetActiveAnchorSide('right')}
              type="button"
            >
              Exit
            </button>
          </div>
        </div>

        <label className="field">
          <span>Accent part</span>
          <select
            disabled={!canEditAccents}
            onChange={(event) => onSetSelectedAccentId(event.target.value || null)}
            value={safeSelectedAccentId ?? ''}
          >
            {selectedGlyph?.accentParts.length ? (
              selectedGlyph.accentParts.map((accent) => (
                <option key={accent.id} value={accent.id}>
                  {accent.label}
                </option>
              ))
            ) : (
              <option value="">No accent part detected</option>
            )}
          </select>
        </label>
      </div>

      <div className="button-row">
        <button onClick={() => onResetSelectedAnchor(activeAnchorSide)} type="button">
          Reset active anchor
        </button>
        <button disabled={!canEditAccents} onClick={onResetSelectedAccent} type="button">
          Reset accent
        </button>
      </div>

      <div className="button-row">
        <button disabled={!canEditAccents} onClick={() => onNudgeSelectedAccent(-0.5, 0)} type="button">
          Accent left
        </button>
        <button disabled={!canEditAccents} onClick={() => onNudgeSelectedAccent(0.5, 0)} type="button">
          Accent right
        </button>
        <button disabled={!canEditAccents} onClick={() => onNudgeSelectedAccent(0, -0.5)} type="button">
          Accent up
        </button>
        <button disabled={!canEditAccents} onClick={() => onNudgeSelectedAccent(0, 0.5)} type="button">
          Accent down
        </button>
      </div>

      <div className="editor-stage">
        {selectedGlyphData && glyphEditorLayout ? (
          <svg
            aria-label={`Editor for ${safeSelectedGlyphChar}`}
            className="glyph-editor-svg"
            onClick={onGlyphCanvasClick}
            onMouseLeave={onStopAccentDrag}
            onMouseMove={onGlyphCanvasMouseMove}
            onMouseUp={onStopAccentDrag}
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
                    layer.kind === 'accent' ? 'is-accent' : 'is-base'
                  } ${safeSelectedAccentId === layer.id ? 'is-selected' : ''}`}
                  d={layer.pathData}
                  onMouseDown={
                    layer.kind === 'accent'
                      ? (event) => onAccentMouseDown(event, layer.id)
                      : undefined
                  }
                />
              ))}
              {glyphEditorAnchors ? (
                <>
                  <g
                    className={`editor-anchor ${activeAnchorSide === 'left' ? 'is-active' : ''}`}
                    transform={`translate(${glyphEditorAnchors.left.x} ${glyphEditorAnchors.left.y})`}
                  >
                    <circle r={activeAnchorSide === 'left' ? 3.6 : 2.6} />
                    <text x="5" y="-4">
                      {safeSelectedGlyphChar}:in
                    </text>
                  </g>
                  <g
                    className={`editor-anchor editor-anchor-right ${
                      activeAnchorSide === 'right' ? 'is-active' : ''
                    }`}
                    transform={`translate(${glyphEditorAnchors.right.x} ${glyphEditorAnchors.right.y})`}
                  >
                    <circle r={activeAnchorSide === 'right' ? 3.6 : 2.6} />
                    <text x="5" y="-4">
                      {safeSelectedGlyphChar}:out
                    </text>
                  </g>
                </>
              ) : null}
            </g>
          </svg>
        ) : (
          <div className="empty-state">
            <h3>No glyph project yet</h3>
            <p>Upload a font or restore a project file to start editing letters.</p>
          </div>
        )}
      </div>

      <div className="layer-grid">
        <article className="layer-card">
          <span>Entry anchor</span>
          <strong>
            {selectedGlyph?.leftConnectXRefMm ?? 'auto'} /{' '}
            {selectedGlyph?.leftConnectYRefMm ?? 'auto'}
          </strong>
        </article>
        <article className="layer-card">
          <span>Exit anchor</span>
          <strong>
            {selectedGlyph?.rightConnectXRefMm ?? 'auto'} /{' '}
            {selectedGlyph?.rightConnectYRefMm ?? 'auto'}
          </strong>
        </article>
        <article className="layer-card">
          <span>Accent offset</span>
          <strong>
            {selectedAccent
              ? `${selectedAccent.xOffsetRefMm} / ${selectedAccent.yOffsetRefMm}`
              : 'n/a'}
          </strong>
        </article>
        {glyphEditorLayers.map((layer) => (
          <article
            key={layer.id}
            className={`layer-card ${safeSelectedAccentId === layer.id ? 'is-selected' : ''}`}
          >
            <span>{layer.kind === 'accent' ? layer.label : 'Base letter'}</span>
            <strong>{layer.kind === 'accent' ? 'Accent part' : 'Main shape'}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
