import type { MouseEvent, PointerEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../lib/glyph-geometry'
import type { AppStrings, LetterlinkGlyph } from '../../types'
import { GlyphEditorPanel } from './GlyphEditorPanel'

type PrepareWorkspaceProps = {
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
  onOpenConfigurator: () => void
  onSetActiveAnchorSide: (side: 'left' | 'right') => void
  onSetSelectedGlyphChar: (value: string) => void
  onSetSelectedAccentId: (value: string | null) => void
  onSelectNextGlyph: () => void
  onSelectPreviousGlyph: () => void
  onResetSelectedAnchor: (side: 'left' | 'right') => void
  onResetSelectedAccent: () => void
  onNudgeSelectedAccent: (deltaX: number, deltaY: number) => void
  onAccentPointerDown: (event: PointerEvent<SVGPathElement>, accentId: string) => void
  onAnchorPointerDown: (event: PointerEvent<SVGGElement>, side: 'left' | 'right') => void
  onGlyphCanvasClick: (event: MouseEvent<SVGSVGElement>) => void
  onGlyphCanvasPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onStopAccentDrag: () => void
}

export function PrepareWorkspace(props: PrepareWorkspaceProps) {
  return (
    <section className="prepare-layout prepare-layout-single">
      <GlyphEditorPanel
        activeAnchorSide={props.activeAnchorSide}
        availableGlyphChars={props.availableGlyphChars}
        canSelectNextGlyph={props.canSelectNextGlyph}
        canSelectPreviousGlyph={props.canSelectPreviousGlyph}
        glyphEditorAnchors={props.glyphEditorAnchors}
        glyphEditorLayers={props.glyphEditorLayers}
        glyphEditorLayout={props.glyphEditorLayout}
        strings={props.strings}
        safeSelectedAccentId={props.safeSelectedAccentId}
        safeSelectedGlyphChar={props.safeSelectedGlyphChar}
        selectedAccent={props.selectedAccent}
        selectedGlyph={props.selectedGlyph}
        selectedGlyphData={props.selectedGlyphData}
        onAccentPointerDown={props.onAccentPointerDown}
        onAnchorPointerDown={props.onAnchorPointerDown}
        onGlyphCanvasClick={props.onGlyphCanvasClick}
        onGlyphCanvasPointerMove={props.onGlyphCanvasPointerMove}
        onNudgeSelectedAccent={props.onNudgeSelectedAccent}
        onOpenConfigurator={props.onOpenConfigurator}
        onResetSelectedAccent={props.onResetSelectedAccent}
        onResetSelectedAnchor={props.onResetSelectedAnchor}
        onSetActiveAnchorSide={props.onSetActiveAnchorSide}
        onSetSelectedGlyphChar={props.onSetSelectedGlyphChar}
        onSelectNextGlyph={props.onSelectNextGlyph}
        onSelectPreviousGlyph={props.onSelectPreviousGlyph}
        onStopAccentDrag={props.onStopAccentDrag}
      />
    </section>
  )
}
