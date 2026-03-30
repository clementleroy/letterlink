import styles from './ProjectReadyCard.module.css'

type ProjectReadyCardProps = {
  canConfigure: boolean
  ctaLabel: string
  currentFontLabel: string
  fontFamily: string
  onOpenConfigurator: () => void
  readyLabel: string
}

export function ProjectReadyCard({
  canConfigure,
  ctaLabel,
  currentFontLabel,
  fontFamily,
  onOpenConfigurator,
  readyLabel,
}: ProjectReadyCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.badge}>{readyLabel}</span>
        <div className={styles.text}>
          <span className={styles.label}>{currentFontLabel}</span>
          <strong className={styles.fontName}>{fontFamily}</strong>
        </div>
      </div>
      <button className={styles.primaryButton} disabled={!canConfigure} onClick={onOpenConfigurator} type="button">
        {ctaLabel}
      </button>
    </div>
  )
}
