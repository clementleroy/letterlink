import type { ReactNode } from 'react'
import styles from './ProjectFeedback.module.css'

type ProjectFeedbackProps = {
  children: ReactNode
  tone: 'error' | 'info'
}

export function ProjectFeedback({ children, tone }: ProjectFeedbackProps) {
  const className = tone === 'error' ? `${styles.message} ${styles.error}` : `${styles.message} ${styles.info}`

  return <div className={className}>{children}</div>
}
