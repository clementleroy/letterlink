import type { ChangeEvent, MouseEvent } from 'react'
import type {
  GlyphEditorLayer,
  GlyphEditorLayout,
  GlyphAnchorPositions,
  ProjectGlyphData,
} from '../../lib/glyph-geometry'
import type { LetterlinkGlyph, LetterlinkProject } from '../../types'
import { GlyphEditorPanel } from './GlyphEditorPanel'
import { ProjectInputsPanel } from './ProjectInputsPanel'

type PrepareWorkspaceProps = {
  activeAnchorSide: 'left' | 'right'
  availableGlyphChars: string[]
  canConfigure: boolean
  glyphEditorAnchors: GlyphAnchorPositions | null
  glyphEditorLayers: GlyphEditorLayer[]
  glyphEditorLayout: GlyphEditorLayout | null
  project: LetterlinkProject | null
  projectError: string
  projectMessage: string
  safeSelectedAccentId: string | null
  safeSelectedGlyphChar: string
  selectedAccent: LetterlinkGlyph['accentParts'][number] | null
  selectedGlyph: LetterlinkGlyph | null
  selectedGlyphData: ProjectGlyphData | null
  onFontUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onProjectUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onDownloadProject: () => void
  onClearProject: () => void
  onOpenConfigurator: () => void
  onSetActiveAnchorSide: (side: 'left' | 'right') => void
  onSetSelectedGlyphChar: (value: string) => void
  onSetSelectedAccentId: (value: string | null) => void
  onResetSelectedAnchor: (side: 'left' | 'right') => void
  onResetSelectedAccent: () => void
  onNudgeSelectedAccent: (deltaX: number, deltaY: number) => void
  onAccentMouseDown: (event: MouseEvent<SVGPathElement>, accentId: string) => void
  onGlyphCanvasClick: (event: MouseEvent<SVGSVGElement>) => void
  onGlyphCanvasMouseMove: (event: MouseEvent<SVGSVGElement>) => void
  onStopAccentDrag: () => void
}

export function PrepareWorkspace(props: PrepareWorkspaceProps) {
  return (
    <section className="prepare-layout">
      <ProjectInputsPanel
        canConfigure={props.canConfigure}
        project={props.project}
        projectError={props.projectError}
        projectMessage={props.projectMessage}
        onFontUpload={props.onFontUpload}
        onProjectUpload={props.onProjectUpload}
        onDownloadProject={props.onDownloadProject}
        onClearProject={props.onClearProject}
        onOpenConfigurator={props.onOpenConfigurator}
      />
      <GlyphEditorPanel
        activeAnchorSide={props.activeAnchorSide}
        availableGlyphChars={props.availableGlyphChars}
        glyphEditorAnchors={props.glyphEditorAnchors}
        glyphEditorLayers={props.glyphEditorLayers}
        glyphEditorLayout={props.glyphEditorLayout}
        safeSelectedAccentId={props.safeSelectedAccentId}
        safeSelectedGlyphChar={props.safeSelectedGlyphChar}
        selectedAccent={props.selectedAccent}
        selectedGlyph={props.selectedGlyph}
        selectedGlyphData={props.selectedGlyphData}
        onAccentMouseDown={props.onAccentMouseDown}
        onGlyphCanvasClick={props.onGlyphCanvasClick}
        onGlyphCanvasMouseMove={props.onGlyphCanvasMouseMove}
        onNudgeSelectedAccent={props.onNudgeSelectedAccent}
        onResetSelectedAccent={props.onResetSelectedAccent}
        onResetSelectedAnchor={props.onResetSelectedAnchor}
        onSetActiveAnchorSide={props.onSetActiveAnchorSide}
        onSetSelectedAccentId={props.onSetSelectedAccentId}
        onSetSelectedGlyphChar={props.onSetSelectedGlyphChar}
        onStopAccentDrag={props.onStopAccentDrag}
      />
    </section>
  )
}
