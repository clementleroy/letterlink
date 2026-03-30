import styles from './WorkflowStep.module.css'

type WorkflowStepProps = {
  disabled?: boolean
  isActive?: boolean
  isDone?: boolean
  isLocked?: boolean
  label: string
  number: number
  onClick: () => void
  subtitle: string
}

export function WorkflowStep({
  disabled,
  isActive,
  isDone,
  isLocked,
  label,
  number,
  onClick,
  subtitle,
}: WorkflowStepProps) {
  const className = [
    styles.step,
    isActive ? styles.active : '',
    isDone ? styles.done : '',
    isLocked ? styles.locked : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={className} disabled={disabled} onClick={onClick} type="button">
      <span aria-hidden="true" className={styles.number}>
        {number}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
    </button>
  )
}
