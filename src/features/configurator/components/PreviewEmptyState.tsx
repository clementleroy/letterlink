import styles from './PreviewEmptyState.module.css'

type PreviewEmptyStateProps = {
  emptyStep1: string
  emptyStep2: string
  title: string
}

export function PreviewEmptyState({ emptyStep1, emptyStep2, title }: PreviewEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <ol className={styles.steps}>
        <li>
          <span aria-hidden="true" className={styles.stepNumber}>
            1
          </span>
          <span>{emptyStep1}</span>
        </li>
        <li>
          <span aria-hidden="true" className={styles.stepNumber}>
            2
          </span>
          <span>{emptyStep2}</span>
        </li>
      </ol>
    </div>
  )
}
