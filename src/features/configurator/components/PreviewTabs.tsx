import type { BoardPage } from '../../../types'
import styles from './PreviewTabs.module.css'

type PreviewTabsProps = {
  currentPageIndex: number
  pages: BoardPage[]
  tabLabel: (index: number) => string
  onCurrentPageChange: (pageIndex: number) => void
}

export function PreviewTabs({
  currentPageIndex,
  pages,
  tabLabel,
  onCurrentPageChange,
}: PreviewTabsProps) {
  return (
    <div className={styles.tabs}>
      {pages.map((page) => (
        <button
          className={page.index === currentPageIndex ? styles.active : undefined}
          key={page.index}
          onClick={() => onCurrentPageChange(page.index)}
          type="button"
        >
          {tabLabel(page.index + 1)}
        </button>
      ))}
    </div>
  )
}
