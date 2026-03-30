import type { MouseEvent, PointerEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../../lib/glyph-geometry'
import type { AppStrings } from '../../../types'
import styles from './GlyphEditorCanvas.module.css'

type GlyphEditorCanvasProps = {
  activeAnchorSide: 'left' | 'right'
  canEditAccents: boolean
  emptyCopy: string
  emptyTitle: string
  glyphEditorAnchors: GlyphAnchorPositions | null
  glyphEditorLayers: GlyphEditorLayer[]
  glyphEditorLayout: GlyphEditorLayout | null
  selectedAccentId: string | null
  selectedGlyphChar: string
  selectedGlyphData: ProjectGlyphData | null
  strings: AppStrings
  onAccentPointerDown: (event: PointerEvent<SVGPathElement>, accentId: string) => void
  onAnchorPointerDown: (event: PointerEvent<SVGGElement>, side: 'left' | 'right') => void
  onGlyphCanvasClick: (event: MouseEvent<SVGSVGElement>) => void
  onGlyphCanvasPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onNudgeSelectedAccent: (deltaX: number, deltaY: number) => void
  onStopAccentDrag: () => void
}

export function GlyphEditorCanvas({
  activeAnchorSide,
  canEditAccents,
  emptyCopy,
  emptyTitle,
  glyphEditorAnchors,
  glyphEditorLayers,
  glyphEditorLayout,
  selectedAccentId,
  selectedGlyphChar,
  selectedGlyphData,
  strings,
  onAccentPointerDown,
  onAnchorPointerDown,
  onGlyphCanvasClick,
  onGlyphCanvasPointerMove,
  onNudgeSelectedAccent,
  onStopAccentDrag,
}: GlyphEditorCanvasProps) {
  return (
    <div className={styles.stage}>
      {selectedGlyphData && glyphEditorLayout ? (
        <svg
          aria-label={strings.prepare.editorAriaLabel(selectedGlyphChar)}
          className={styles.svg}
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
            className={styles.background}
            height={glyphEditorLayout.height}
            rx="24"
            width={glyphEditorLayout.width}
          />
          <g
            transform={`translate(${glyphEditorLayout.offsetX} ${glyphEditorLayout.offsetY}) scale(${glyphEditorLayout.scale})`}
          >
            {glyphEditorLayers.map((layer) => {
              const layerClassName = [
                styles.path,
                layer.kind === 'accent'
                  ? styles.accent
                  : layer.kind === 'bridge'
                    ? styles.bridge
                    : styles.base,
                selectedAccentId === layer.id ? styles.selected : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <path
                  className={layerClassName}
                  d={layer.pathData}
                  key={layer.id}
                  onPointerDown={
                    layer.kind === 'accent'
                      ? (event) => onAccentPointerDown(event, layer.id)
                      : undefined
                  }
                />
              )
            })}
            {glyphEditorAnchors ? (
              <>
                <g
                  className={`${styles.anchor} ${
                    activeAnchorSide === 'left' ? styles.anchorActive : ''
                  }`}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => onAnchorPointerDown(event, 'left')}
                  transform={`translate(${glyphEditorAnchors.left.x} ${glyphEditorAnchors.left.y})`}
                >
                  <circle r={activeAnchorSide === 'left' ? 3.6 : 2.6} />
                  <text x="5" y="-4">
                    {selectedGlyphChar}:{strings.prepare.anchorInlineStart}
                  </text>
                </g>
                <g
                  className={`${styles.anchor} ${styles.anchorRight} ${
                    activeAnchorSide === 'right' ? styles.anchorActive : ''
                  }`}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => onAnchorPointerDown(event, 'right')}
                  transform={`translate(${glyphEditorAnchors.right.x} ${glyphEditorAnchors.right.y})`}
                >
                  <circle r={activeAnchorSide === 'right' ? 3.6 : 2.6} />
                  <text x="5" y="-4">
                    {selectedGlyphChar}:{strings.prepare.anchorInlineEnd}
                  </text>
                </g>
              </>
            ) : null}
          </g>
        </svg>
      ) : (
        <div className={styles.emptyState}>
          <h3>{emptyTitle}</h3>
          <p>{emptyCopy}</p>
        </div>
      )}
    </div>
  )
}
