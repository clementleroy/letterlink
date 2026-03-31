import type { AppStrings, BoardPage, TextRenderSettings } from '../../types'
import styles from './components/BoardPreviewPanel.module.css'
import { BoardCanvas } from './components/BoardCanvas'
import { BoardNavigationBar } from './components/BoardNavigationBar'
import { PreviewEmptyState } from './components/PreviewEmptyState'
import { PreviewExportBar } from './components/PreviewExportBar'
import { PreviewHeader } from './components/PreviewHeader'
import { PreviewTabs } from './components/PreviewTabs'

type BoardPreviewPanelProps = {
  currentBoard: BoardPage | undefined
  currentPageIndex: number
  marginMm: number
  pages: BoardPage[]
  previewScale: number
  renderSettings: TextRenderSettings
  strings: AppStrings
  onCurrentPageChange: (pageIndex: number) => void
  onDownloadBoard: () => void
  onDownloadNames: () => void
  onDownloadProject: () => void
  onDownloadAll: () => void
}

export function BoardPreviewPanel({
  currentBoard,
  currentPageIndex,
  marginMm,
  pages,
  previewScale,
  renderSettings,
  strings,
  onCurrentPageChange,
  onDownloadBoard,
  onDownloadNames,
  onDownloadProject,
  onDownloadAll,
}: BoardPreviewPanelProps) {
  return (
    <section className={styles.panel}>
      <PreviewHeader copy={strings.preview.copy} title={strings.preview.title} />

      <PreviewTabs
        currentPageIndex={currentPageIndex}
        pages={pages}
        tabLabel={strings.preview.boardTabLabel}
        onCurrentPageChange={onCurrentPageChange}
      />

      {pages.length > 0 ? (
        <BoardNavigationBar
          currentBoard={currentBoard}
          currentPageIndex={currentPageIndex}
          pages={pages}
          readyLabel={strings.preview.boardNavReady}
          summaryLabel={strings.preview.boardNavInfo}
          onCurrentPageChange={onCurrentPageChange}
        />
      ) : null}

      <div className={styles.stage}>
        {currentBoard ? (
          <BoardCanvas
            currentBoard={currentBoard}
            marginMm={marginMm}
            previewScale={previewScale}
            renderSettings={renderSettings}
            strings={strings.preview}
          />
        ) : (
          <PreviewEmptyState
            emptyStep1={strings.preview.emptyStep1}
            emptyStep2={strings.preview.emptyStep2}
            title={strings.preview.emptyTitle}
          />
        )}
      </div>

      <PreviewExportBar
        canExportAll={pages.length > 0}
        canExportCurrent={Boolean(currentBoard)}
        canExportNames={pages.length > 0}
        exportAllLabel={strings.preview.exportAllBoards}
        exportCurrentLabel={strings.preview.exportCurrentBoard}
        exportNamesLabel={strings.preview.exportAllNames}
        saveProjectLabel={strings.preview.saveProjectFile}
        onDownloadAll={onDownloadAll}
        onDownloadBoard={onDownloadBoard}
        onDownloadNames={onDownloadNames}
        onDownloadProject={onDownloadProject}
      />

    </section>
  )
}
