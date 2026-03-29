import { useState } from 'react'
import type { ChangeEvent } from 'react'
import './styles/app-shell.css'
import './styles/project-workflow.css'
import './styles/configurator.css'
import { AppHero } from './components/AppHero'
import { ProjectStatusStrip } from './components/ProjectStatusStrip'
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher'
import { parseProjectFileText, triggerProjectDownload, triggerZipDownload } from './lib/export'
import { buildSvgDocument } from './lib/svg'
import { useConfiguratorState } from './hooks/useConfiguratorState'
import { useGlyphEditorState } from './hooks/useGlyphEditorState'
import { useLetterlinkProject } from './hooks/useLetterlinkProject'
import { PrepareWorkspace } from './features/project-workflow/PrepareWorkspace'
import { ConfiguratorWorkspace } from './features/configurator/ConfiguratorWorkspace'
import type { GlyphDebugAnchor } from './types'

type WorkspaceStep = 'prepare' | 'configure'

function renderBoardDebugAnchors(itemId: string, anchors: GlyphDebugAnchor[] | undefined) {
  if (!anchors) {
    return null
  }

  return anchors.map((anchor, index) => (
    <g
      key={`${itemId}-${anchor.char}-${anchor.side}-${index}`}
      className={`debug-anchor debug-anchor-${anchor.side}`}
      transform={`translate(${anchor.xMm} ${anchor.yMm})`}
    >
      <circle r="1.2" />
      <text x="1.8" y="-1.4">
        {anchor.char}:{anchor.side === 'left' ? 'L' : 'R'}
      </text>
    </g>
  ))
}

function App() {
  const projectState = useLetterlinkProject(parseProjectFileText)
  const configuratorState = useConfiguratorState(projectState.glyphMap)
  const glyphEditorState = useGlyphEditorState(projectState.project, projectState.glyphMap)
  const [workspaceStep, setWorkspaceStep] = useState<WorkspaceStep>(
    projectState.project ? 'configure' : 'prepare',
  )

  const canConfigure = Boolean(projectState.glyphMap)
  const projectStats = {
    entries: configuratorState.inputItems.length,
    pages: configuratorState.pages.length,
    glyphs: projectState.project?.glyphs.length ?? 0,
    accents:
      projectState.project?.glyphs.reduce((sum, glyph) => sum + glyph.accentParts.length, 0) ?? 0,
  }

  const handleFontUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await projectState.importFontFile(file)
    glyphEditorState.ensureSelectedGlyph()
    setWorkspaceStep('prepare')
    event.target.value = ''
  }

  const handleProjectUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()
    projectState.importProjectText(text, file.name)
    glyphEditorState.ensureSelectedGlyph()
    setWorkspaceStep('configure')
    event.target.value = ''
  }

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await configuratorState.onCsvUpload(file)
    event.target.value = ''
  }

  const handleDownloadProject = () => {
    if (!projectState.project) {
      return
    }

    triggerProjectDownload(projectState.project)
  }

  const handleDownloadBoard = () => {
    if (!configuratorState.currentBoard) {
      return
    }

    const blob = new Blob([buildSvgDocument(configuratorState.currentBoard)], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `planche-${configuratorState.currentBoard.index + 1}.svg`
    anchor.click()
    URL.revokeObjectURL(url)
    configuratorState.setStatusMessage(
      `Board ${configuratorState.currentBoard.index + 1} downloaded.`,
    )
  }

  const handleDownloadAll = async () => {
    if (configuratorState.pages.length === 0) {
      return
    }

    configuratorState.setStatusMessage('Preparing SVG export...')

    try {
      await triggerZipDownload(configuratorState.pages)
      configuratorState.setStatusMessage(`${configuratorState.pages.length} board(s) exported.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.'
      configuratorState.setStatusMessage(message)
    }
  }

  return (
    <main className="app-shell">
      <AppHero
        accents={projectStats.accents}
        glyphs={projectStats.glyphs}
        pages={projectStats.pages}
      />

      <WorkspaceSwitcher
        canConfigure={canConfigure}
        onChange={setWorkspaceStep}
        workspaceStep={workspaceStep}
      />

      <ProjectStatusStrip project={projectState.project} readiness={projectState.readiness} />

      {workspaceStep === 'prepare' ? (
        <PrepareWorkspace
          activeAnchorSide={glyphEditorState.activeAnchorSide}
          availableGlyphChars={glyphEditorState.availableGlyphChars}
          canConfigure={canConfigure}
          glyphEditorAnchors={glyphEditorState.glyphEditorAnchors}
          glyphEditorLayers={glyphEditorState.glyphEditorLayers}
          glyphEditorLayout={glyphEditorState.glyphEditorLayout}
          project={projectState.project}
          projectError={projectState.projectError}
          projectMessage={projectState.projectMessage}
          safeSelectedAccentId={glyphEditorState.safeSelectedAccentId}
          safeSelectedGlyphChar={glyphEditorState.safeSelectedGlyphChar}
          selectedAccent={glyphEditorState.selectedAccent}
          selectedGlyph={glyphEditorState.selectedGlyph}
          selectedGlyphData={glyphEditorState.selectedGlyphData}
          onAccentMouseDown={glyphEditorState.onAccentMouseDown}
          onClearProject={projectState.clearProject}
          onDownloadProject={handleDownloadProject}
          onFontUpload={handleFontUpload}
          onGlyphCanvasClick={(event) =>
            glyphEditorState.onGlyphCanvasClick(event, projectState.updateGlyph)
          }
          onGlyphCanvasMouseMove={(event) =>
            glyphEditorState.onGlyphCanvasMouseMove(event, projectState.updateGlyph)
          }
          onNudgeSelectedAccent={(deltaX, deltaY) =>
            glyphEditorState.nudgeSelectedAccent(deltaX, deltaY, projectState.updateGlyph)
          }
          onOpenConfigurator={() => setWorkspaceStep('configure')}
          onProjectUpload={handleProjectUpload}
          onResetSelectedAccent={() =>
            glyphEditorState.resetSelectedAccent(projectState.updateGlyph)
          }
          onResetSelectedAnchor={(side) =>
            glyphEditorState.resetSelectedAnchor(side, projectState.updateGlyph)
          }
          onSetActiveAnchorSide={glyphEditorState.setActiveAnchorSide}
          onSetSelectedAccentId={glyphEditorState.setSelectedAccentId}
          onSetSelectedGlyphChar={glyphEditorState.setSelectedGlyphChar}
          onStopAccentDrag={glyphEditorState.stopAccentDrag}
        />
      ) : (
        <ConfiguratorWorkspace
          boardSettings={configuratorState.boardSettings}
          csvColumns={configuratorState.csvColumns}
          currentBoard={configuratorState.currentBoard}
          currentPageIndex={configuratorState.currentPageIndex}
          entries={projectStats.entries}
          pages={configuratorState.pages}
          previewScale={configuratorState.previewScale}
          project={projectState.project}
          rawText={configuratorState.rawText}
          renderBoardDebugAnchors={(itemId, anchors) =>
            configuratorState.showDebugAnchors ? renderBoardDebugAnchors(itemId, anchors) : null
          }
          renderSettings={configuratorState.renderSettings}
          selectedColumn={configuratorState.selectedColumn}
          showDebugAnchors={configuratorState.showDebugAnchors}
          sourceMode={configuratorState.sourceMode}
          statusMessage={configuratorState.statusMessage}
          onCsvUpload={handleCsvUpload}
          onCurrentPageChange={configuratorState.setCurrentPage}
          onDownloadAll={handleDownloadAll}
          onDownloadBoard={handleDownloadBoard}
          onDownloadProject={handleDownloadProject}
          onSetRawText={configuratorState.setRawText}
          onSetSelectedColumn={configuratorState.setSelectedColumn}
          onSetShowDebugAnchors={configuratorState.setShowDebugAnchors}
          onSetSourceMode={configuratorState.setSourceMode}
          updateBoardSetting={configuratorState.updateBoardSetting}
          updateRenderSetting={configuratorState.updateRenderSetting}
        />
      )}
    </main>
  )
}

export default App
