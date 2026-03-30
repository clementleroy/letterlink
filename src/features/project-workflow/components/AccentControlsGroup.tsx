import type { MutableRefObject, PointerEvent } from 'react'
import styles from './ToolbarGroup.module.css'
import { NudgePad } from './NudgePad'

type NudgeDirection = {
  direction: 'down' | 'left' | 'right' | 'up'
  dx: number
  dy: number
  symbol: string
  title: string
}

type AccentControlsGroupProps = {
  accentLabel: string
  accentName: string
  canEditAccents: boolean
  directions: readonly NudgeDirection[]
  resetLabel: string
  suppressClickRef: MutableRefObject<boolean>
  onNudge: (deltaX: number, deltaY: number) => void
  onResetSelectedAccent: () => void
  onStartNudgeRepeat: (
    event: PointerEvent<HTMLButtonElement>,
    deltaX: number,
    deltaY: number,
  ) => void
  onStopNudgeRepeat: () => void
}

export function AccentControlsGroup({
  accentLabel,
  accentName,
  canEditAccents,
  directions,
  resetLabel,
  suppressClickRef,
  onNudge,
  onResetSelectedAccent,
  onStartNudgeRepeat,
  onStopNudgeRepeat,
}: AccentControlsGroupProps) {
  return (
    <div className={`${styles.group} ${!canEditAccents ? styles.disabled : ''}`}>
      <span className={styles.groupLabel}>{accentLabel}</span>
      <div className={styles.row}>
        <div className={styles.accentControls}>
          <p className={styles.accentHint}>{accentName}</p>
          <button
            className={styles.ghostButton}
            disabled={!canEditAccents}
            onClick={onResetSelectedAccent}
            type="button"
          >
            {resetLabel}
          </button>
        </div>

        <NudgePad
          canEditAccents={canEditAccents}
          directions={directions}
          suppressClickRef={suppressClickRef}
          onNudge={onNudge}
          onStartNudgeRepeat={onStartNudgeRepeat}
          onStopNudgeRepeat={onStopNudgeRepeat}
        />
      </div>
    </div>
  )
}
