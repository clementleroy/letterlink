import type { AppStrings, BoardPage, LetterlinkProject, TextRenderSettings } from '../../types'

type BoardPreviewPanelProps = {
  currentBoard: BoardPage | undefined
  currentPageIndex: number
  entries: number
  pages: BoardPage[]
  previewScale: number
  project: LetterlinkProject | null
  renderSettings: TextRenderSettings
  strings: AppStrings
  onCurrentPageChange: (pageIndex: number) => void
  onDownloadBoard: () => void
  onDownloadProject: () => void
  onDownloadAll: () => void
}

export function BoardPreviewPanel({
  currentBoard,
  currentPageIndex,
  entries,
  pages,
  previewScale,
  project,
  renderSettings,
  strings,
  onCurrentPageChange,
  onDownloadBoard,
  onDownloadProject,
  onDownloadAll,
}: BoardPreviewPanelProps) {
  return (
    <section className="panel preview-panel">
      <div className="section-head preview-head">
        <div>
          <h2>{strings.preview.title}</h2>
          <p>{strings.preview.copy}</p>
        </div>
      </div>

      <div className="page-tabs">
        {pages.map((page) => (
          <button
            key={page.index}
            className={page.index === currentPageIndex ? 'active' : ''}
            onClick={() => onCurrentPageChange(page.index)}
            type="button"
          >
            {strings.preview.boardTabLabel(page.index + 1)}
          </button>
        ))}
      </div>

      {pages.length > 0 && (
        <div className="board-nav-bar">
          <button
            className="btn-ghost btn-board-nav"
            disabled={currentPageIndex <= 0}
            onClick={() => onCurrentPageChange(currentPageIndex - 1)}
            type="button"
            aria-label="Previous board"
          >
            ‹
          </button>
          <span className="board-nav-info">
            {currentBoard
              ? strings.preview.boardNavInfo(
                  currentPageIndex + 1,
                  pages.length,
                  currentBoard.items.length,
                  currentBoard.widthMm,
                  currentBoard.heightMm,
                )
              : strings.preview.boardNavReady(pages.length)}
          </span>
          <button
            className="btn-ghost btn-board-nav"
            disabled={currentPageIndex >= pages.length - 1}
            onClick={() => onCurrentPageChange(currentPageIndex + 1)}
            type="button"
            aria-label="Next board"
          >
            ›
          </button>
        </div>
      )}

      <div className="preview-stage">
        {currentBoard ? (
          <div
            className="board-frame"
            style={{
              width: `${currentBoard.widthMm * previewScale}px`,
            }}
          >
            <svg
              aria-label={strings.preview.boardAriaLabel(currentBoard.index + 1)}
              className="board-svg"
              height={`${currentBoard.heightMm}mm`}
              viewBox={`0 0 ${currentBoard.widthMm} ${currentBoard.heightMm}`}
              width={`${currentBoard.widthMm}mm`}
            >
              <rect
                className="board-background"
                height={currentBoard.heightMm}
                rx="3"
                width={currentBoard.widthMm}
              />
              {currentBoard.items.map((item) => (
                <g key={`${item.id}-${item.name}`} transform={`translate(${item.xMm} ${item.yMm})`}>
                  {renderSettings.renderMode === 'fill' ? (
                    <path d={item.pathData} fill="currentColor" />
                  ) : (
                    <path
                      d={item.pathData}
                      fill="none"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth={renderSettings.strokeWidthMm}
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="empty-state empty-state-guided">
            <h3>{strings.preview.emptyTitle}</h3>
            <ol className="empty-state-steps">
              <li>
                <span className="empty-step-number" aria-hidden="true">1</span>
                <span>{strings.preview.emptyStep1}</span>
              </li>
              <li>
                <span className="empty-step-number" aria-hidden="true">2</span>
                <span>{strings.preview.emptyStep2}</span>
              </li>
            </ol>
          </div>
        )}
      </div>

      <div className="preview-export-footer">
        <button
          className="btn-primary"
          disabled={pages.length === 0}
          onClick={onDownloadAll}
          type="button"
        >
          {strings.preview.exportAllBoards}
        </button>
        <button disabled={!currentBoard} onClick={onDownloadBoard} type="button">
          {strings.preview.exportCurrentBoard}
        </button>
        <button onClick={onDownloadProject} type="button">
          {strings.preview.saveProjectFile}
        </button>
      </div>

      <div className="summary-grid">
        <article>
          <span>{strings.preview.namesReady}</span>
          <strong>{entries}</strong>
        </article>
        <article>
          <span>{strings.preview.boardsGenerated}</span>
          <strong>{pages.length}</strong>
        </article>
        <article>
          <span>{strings.preview.currentBoard}</span>
          <strong>{currentBoard ? currentBoard.index + 1 : '—'}</strong>
        </article>
        <article>
          <span>{strings.preview.project}</span>
          <strong>{project?.source.fontFamily ?? strings.preview.noProjectLoaded}</strong>
        </article>
      </div>
    </section>
  )
}
