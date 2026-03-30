import styles from './ProjectIntroCard.module.css'

type ProjectIntroCardProps = {
  acceptedInputsLabel: string
  acceptedInputsValue: string
}

export function ProjectIntroCard({
  acceptedInputsLabel,
  acceptedInputsValue,
}: ProjectIntroCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.copy}>
        <span className={styles.label}>{acceptedInputsLabel}</span>
        <p>{acceptedInputsValue}</p>
      </div>
      <div aria-hidden="true" className={styles.badges}>
        <span className={styles.badge}>TTF</span>
        <span className={styles.badge}>OTF</span>
        <span className={styles.badge}>JSON</span>
      </div>
    </div>
  )
}
