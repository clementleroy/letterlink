import type { BoardPage } from '../../../types'
import styles from './BoardNavigationBar.module.css'

type BoardNavigationBarProps = {
  currentBoard: BoardPage | undefined
  currentPageIndex: number
  pages: BoardPage[]
  readyLabel: (count: number) => string
  summaryLabel: (
    currentPage: number,
    totalPages: number,
    itemCount: number,
    widthMm: number,
    heightMm: number,
  ) => string
  onCurrentPageChange: (pageIndex: number) => void
}

export function BoardNavigationBar({
  currentBoard,
  currentPageIndex,
  pages,
  readyLabel,
  summaryLabel,
  onCurrentPageChange,
}: BoardNavigationBarProps) {
  return (
    <div className={styles.bar}>
      <button
        className={styles.navButton}
        disabled={currentPageIndex <= 0}
        onClick={() => onCurrentPageChange(currentPageIndex - 1)}
        type="button"
      >
        ‹
      </button>
      <span className={styles.info}>
        {currentBoard
          ? summaryLabel(
              currentPageIndex + 1,
              pages.length,
              currentBoard.items.length,
              currentBoard.widthMm,
              currentBoard.heightMm,
            )
          : readyLabel(pages.length)}
      </span>
      <button
        className={styles.navButton}
        disabled={currentPageIndex >= pages.length - 1}
        onClick={() => onCurrentPageChange(currentPageIndex + 1)}
        type="button"
      >
        ›
      </button>
    </div>
  )
}
