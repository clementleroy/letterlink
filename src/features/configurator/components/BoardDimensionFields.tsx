import styles from './InputSection.module.css'

type BoardDimensionFieldsProps = {
  boardHeight: number
  boardWidth: number
  heightLabel: string
  widthLabel: string
  onSetBoardHeight: (value: number) => void
  onSetBoardWidth: (value: number) => void
}

export function BoardDimensionFields({
  boardHeight,
  boardWidth,
  heightLabel,
  widthLabel,
  onSetBoardHeight,
  onSetBoardWidth,
}: BoardDimensionFieldsProps) {
  return (
    <div className={styles.fieldGrid}>
      <label className={styles.field}>
        <span>{widthLabel}</span>
        <input
          min="50"
          onChange={(event) => onSetBoardWidth(Number(event.target.value))}
          step="1"
          type="number"
          value={boardWidth}
        />
      </label>
      <label className={styles.field}>
        <span>{heightLabel}</span>
        <input
          min="50"
          onChange={(event) => onSetBoardHeight(Number(event.target.value))}
          step="1"
          type="number"
          value={boardHeight}
        />
      </label>
    </div>
  )
}
