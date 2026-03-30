import styles from './ToolbarGroup.module.css'

type AnchorControlsGroupProps = {
  activeAnchorSide: 'left' | 'right'
  connectionPointLabel: string
  endLabel: string
  resetLabel: string
  startLabel: string
  onResetSelectedAnchor: (side: 'left' | 'right') => void
  onSetActiveAnchorSide: (side: 'left' | 'right') => void
}

export function AnchorControlsGroup({
  activeAnchorSide,
  connectionPointLabel,
  endLabel,
  resetLabel,
  startLabel,
  onResetSelectedAnchor,
  onSetActiveAnchorSide,
}: AnchorControlsGroupProps) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{connectionPointLabel}</span>
      <div className={styles.row}>
        <div className={styles.segmented}>
          <button
            className={activeAnchorSide === 'left' ? styles.active : undefined}
            onClick={() => onSetActiveAnchorSide('left')}
            type="button"
          >
            {startLabel}
          </button>
          <button
            className={activeAnchorSide === 'right' ? styles.active : undefined}
            onClick={() => onSetActiveAnchorSide('right')}
            type="button"
          >
            {endLabel}
          </button>
        </div>
        <button className={styles.ghostButton} onClick={() => onResetSelectedAnchor(activeAnchorSide)} type="button">
          {resetLabel}
        </button>
      </div>
    </div>
  )
}
