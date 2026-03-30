import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { AppHero } from './components/AppHero'
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher'
import { AppShell } from './components/app-shell/AppShell'
import { triggerProjectDownload, triggerSvgDownload, triggerZipDownload } from './lib/export'
import { createGlyphMap } from './lib/glyphs'
import { getAppStrings, resolveBrowserLanguage, type AppLanguage } from './lib/i18n'
import { loadStoredLanguage, saveStoredLanguage } from './lib/project-store'
import { useConfiguratorState } from './hooks/useConfiguratorState'
import { useGlyphEditorState } from './hooks/useGlyphEditorState'
import { useLetterlinkProject } from './hooks/useLetterlinkProject'
import { ProjectInputsPanel } from './features/project-workflow/ProjectInputsPanel'
import { PrepareWorkspace } from './features/project-workflow/PrepareWorkspace'
import { ConfiguratorWorkspace } from './features/configurator/ConfiguratorWorkspace'

type WorkspaceStep = 'project' | 'prepare' | 'configure'

function App() {
  const [language, setLanguage] = useState<AppLanguage>(
    () => loadStoredLanguage() ?? resolveBrowserLanguage(),
  )
  const strings = useMemo(() => getAppStrings(language), [language])
  const projectState = useLetterlinkProject(language)
  const configuredGlyphMap = useMemo(
    () => (projectState.projectSnapshot ? createGlyphMap(projectState.projectSnapshot) : null),
    [projectState.projectSnapshot],
  )
  const configuratorState = useConfiguratorState(configuredGlyphMap, language)
  const glyphEditorState = useGlyphEditorState(projectState.project, projectState.glyphMap)
  const [workspaceStep, setWorkspaceStep] = useState<WorkspaceStep>('project')

  useEffect(() => {
    saveStoredLanguage(language)
  }, [language])

  const canPrepare = Boolean(projectState.project)
  const canConfigure = Boolean(projectState.glyphMap)
  const projectStats = {
    entries: configuratorState.inputItems.length,
  }

  const handleWorkspaceChange = (nextStep: WorkspaceStep) => {
    if (nextStep === 'prepare' && !canPrepare) {
      return
    }

    if (nextStep === 'configure') {
      if (!canConfigure) {
        return
      }

      projectState.refreshProjectSnapshot()
    }

    setWorkspaceStep(nextStep)
  }

  const handleFontUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await projectState.importFontFile(file)
    glyphEditorState.ensureSelectedGlyph()
    setWorkspaceStep('project')
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
    setWorkspaceStep('project')
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

    triggerSvgDownload(configuratorState.currentBoard)
    configuratorState.setStatusMessage({
      key: 'config.boardDownloaded',
      boardIndex: configuratorState.currentBoard.index + 1,
    })
  }

  const handleDownloadAll = async () => {
    if (configuratorState.pages.length === 0) {
      return
    }

    configuratorState.setStatusMessage({ key: 'config.preparingSvgExport' })

    try {
      await triggerZipDownload(configuratorState.pages)
      configuratorState.setStatusMessage({
        key: 'config.boardsExported',
        count: configuratorState.pages.length,
      })
    } catch (error) {
      configuratorState.setStatusMessage(
        error instanceof Error && error.message
          ? { key: 'raw', text: error.message }
          : { key: 'config.exportFailed' },
      )
    }
  }

  return (
    <AppShell
      topbar={
        <>
          <AppHero
            language={language}
            onLanguageChange={setLanguage}
            strings={strings}
          />

          <WorkspaceSwitcher
            canPrepare={canPrepare}
            canConfigure={canConfigure}
            onChange={handleWorkspaceChange}
            strings={strings}
            workspaceStep={workspaceStep}
          />
        </>
      }
    >

      {workspaceStep === 'project' ? (
        <ProjectInputsPanel
          canConfigure={canPrepare}
          project={projectState.project}
          projectError={projectState.projectError}
          projectMessage={projectState.projectMessage}
          strings={strings}
          onFontUpload={handleFontUpload}
          onProjectUpload={handleProjectUpload}
          onDownloadProject={handleDownloadProject}
          onClearProject={projectState.clearProject}
          onOpenConfigurator={() => handleWorkspaceChange('prepare')}
        />
      ) : null}

      {workspaceStep === 'prepare' ? (
        <PrepareWorkspace
          activeAnchorSide={glyphEditorState.activeAnchorSide}
          availableGlyphChars={glyphEditorState.availableGlyphChars}
          canSelectNextGlyph={glyphEditorState.canSelectNextGlyph}
          canSelectPreviousGlyph={glyphEditorState.canSelectPreviousGlyph}
          glyphEditorAnchors={glyphEditorState.glyphEditorAnchors}
          glyphEditorLayers={glyphEditorState.glyphEditorLayers}
          glyphEditorLayout={glyphEditorState.glyphEditorLayout}
          strings={strings}
          safeSelectedAccentId={glyphEditorState.safeSelectedAccentId}
          safeSelectedGlyphChar={glyphEditorState.safeSelectedGlyphChar}
          selectedAccent={glyphEditorState.selectedAccent}
          selectedGlyph={glyphEditorState.selectedGlyph}
          selectedGlyphData={glyphEditorState.selectedGlyphData}
          onAccentPointerDown={glyphEditorState.onAccentPointerDown}
          onAnchorPointerDown={glyphEditorState.onAnchorPointerDown}
          onGlyphCanvasClick={(event) =>
            glyphEditorState.onGlyphCanvasClick(event, projectState.updateGlyph)
          }
          onGlyphCanvasPointerMove={(event) =>
            glyphEditorState.onGlyphCanvasPointerMove(event, projectState.updateGlyph)
          }
          onNudgeSelectedAccent={(deltaX, deltaY) =>
            glyphEditorState.nudgeSelectedAccent(deltaX, deltaY, projectState.updateGlyph)
          }
          onOpenConfigurator={() => handleWorkspaceChange('configure')}
          onResetSelectedAccent={() =>
            glyphEditorState.resetSelectedAccent(projectState.updateGlyph)
          }
          onResetSelectedAnchor={(side) =>
            glyphEditorState.resetSelectedAnchor(side, projectState.updateGlyph)
          }
          onSelectNextGlyph={glyphEditorState.selectNextGlyph}
          onSelectPreviousGlyph={glyphEditorState.selectPreviousGlyph}
          onSetActiveAnchorSide={glyphEditorState.setActiveAnchorSide}
          onSetSelectedAccentId={glyphEditorState.setSelectedAccentId}
          onSetSelectedGlyphChar={glyphEditorState.setSelectedGlyphChar}
          onStopAccentDrag={glyphEditorState.stopAccentDrag}
        />
      ) : null}

      {workspaceStep === 'configure' ? (
        <ConfiguratorWorkspace
          boardSettings={configuratorState.boardSettings}
          csvColumns={configuratorState.csvColumns}
          currentBoard={configuratorState.currentBoard}
          currentPageIndex={configuratorState.currentPageIndex}
          entries={projectStats.entries}
          pages={configuratorState.pages}
          previewScale={configuratorState.previewScale}
          project={projectState.projectSnapshot}
          rawText={configuratorState.rawText}
          renderSettings={configuratorState.renderSettings}
          selectedColumn={configuratorState.selectedColumn}
          sourceMode={configuratorState.sourceMode}
          statusMessage={configuratorState.statusMessage}
          strings={strings}
          onCsvUpload={handleCsvUpload}
          onCurrentPageChange={configuratorState.setCurrentPage}
          onDownloadAll={handleDownloadAll}
          onDownloadBoard={handleDownloadBoard}
          onDownloadProject={handleDownloadProject}
          onSetRawText={configuratorState.setRawText}
          onSetSelectedColumn={configuratorState.setSelectedColumn}
          onSetSourceMode={configuratorState.setSourceMode}
          updateBoardSetting={configuratorState.updateBoardSetting}
          updateRenderSetting={configuratorState.updateRenderSetting}
        />
      ) : null}
    </AppShell>
  )
}

export default App
