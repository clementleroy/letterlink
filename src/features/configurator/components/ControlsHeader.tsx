import styles from './ControlsHeader.module.css'

type ControlsHeaderProps = {
  copy: string
  sourceCsvLabel: string
  sourceMode: 'csv' | 'text'
  sourceTextLabel: string
  title: string
  onSetSourceMode: (value: 'csv' | 'text') => void
}

export function ControlsHeader({
  copy,
  sourceCsvLabel,
  sourceMode,
  sourceTextLabel,
  title,
  onSetSourceMode,
}: ControlsHeaderProps) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.copyBlock}>
        <h2>{title}</h2>
        <p className={styles.panelCopy}>{copy}</p>
      </div>
      <div className={styles.segmented}>
        <button
          className={sourceMode === 'text' ? styles.active : undefined}
          onClick={() => onSetSourceMode('text')}
          type="button"
        >
          {sourceTextLabel}
        </button>
        <button
          className={sourceMode === 'csv' ? styles.active : undefined}
          onClick={() => onSetSourceMode('csv')}
          type="button"
        >
          {sourceCsvLabel}
        </button>
      </div>
    </div>
  )
}
