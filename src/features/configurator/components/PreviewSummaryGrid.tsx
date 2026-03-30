import type { BoardPage } from '../../../types'
import styles from './PreviewSummaryGrid.module.css'

type PreviewSummaryGridProps = {
  boardsGeneratedLabel: string
  currentBoard: BoardPage | undefined
  currentBoardLabel: string
  entries: number
  namesReadyLabel: string
  noProjectLoadedLabel: string
  pages: BoardPage[]
  projectLabel: string
  projectName: string | null
}

export function PreviewSummaryGrid({
  boardsGeneratedLabel,
  currentBoard,
  currentBoardLabel,
  entries,
  namesReadyLabel,
  noProjectLoadedLabel,
  pages,
  projectLabel,
  projectName,
}: PreviewSummaryGridProps) {
  const items = [
    { label: namesReadyLabel, value: String(entries) },
    { label: boardsGeneratedLabel, value: String(pages.length) },
    { label: currentBoardLabel, value: currentBoard ? String(currentBoard.index + 1) : '—' },
    { label: projectLabel, value: projectName ?? noProjectLoadedLabel },
  ]

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article className={styles.card} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  )
}
