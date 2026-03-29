import type { ReactNode } from 'react'
import type { BoardPage, LetterlinkProject, TextRenderSettings } from '../../types'

type BoardPreviewPanelProps = {
  currentBoard: BoardPage | undefined
  currentPageIndex: number
  entries: number
  pages: BoardPage[]
  previewScale: number
  project: LetterlinkProject | null
  renderSettings: TextRenderSettings
  renderBoardDebugAnchors: (itemId: string, anchors: BoardPage['items'][number]['debugAnchors']) => ReactNode
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
  renderBoardDebugAnchors,
  onCurrentPageChange,
  onDownloadBoard,
  onDownloadProject,
  onDownloadAll,
}: BoardPreviewPanelProps) {
  return (
    <section className="panel preview-panel">
      <div className="section-head preview-head">
        <div>
          <h2>Board preview</h2>
          <p>
            The configurator reuses the active project setup for manual names and CSV imports.
          </p>
        </div>
        <div className="button-row">
          <button onClick={onDownloadProject} type="button">
            Download project
          </button>
          <button disabled={!currentBoard} onClick={onDownloadBoard} type="button">
            Download board
          </button>
          <button disabled={pages.length === 0} onClick={onDownloadAll} type="button">
            Download all
          </button>
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
            Board {page.index + 1}
          </button>
        ))}
      </div>

      <div className="preview-stage">
        {currentBoard ? (
          <div
            className="board-frame"
            style={{
              width: `${currentBoard.widthMm * previewScale}px`,
            }}
          >
            <svg
              aria-label={`Board ${currentBoard.index + 1}`}
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
                  {renderBoardDebugAnchors(item.id, item.debugAnchors)}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No boards yet</h3>
            <p>Enter names in the controls panel, or upload a CSV to generate your first preview.</p>
          </div>
        )}
      </div>

      <div className="summary-grid">
        <article>
          <span>Usable entries</span>
          <strong>{entries}</strong>
        </article>
        <article>
          <span>Generated boards</span>
          <strong>{pages.length}</strong>
        </article>
        <article>
          <span>Active page</span>
          <strong>{currentBoard ? currentBoard.index + 1 : '—'}</strong>
        </article>
        <article>
          <span>Project</span>
          <strong>{project?.source.fontFamily ?? 'Missing'}</strong>
        </article>
      </div>
    </section>
  )
}
