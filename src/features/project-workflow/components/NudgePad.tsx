import type { MutableRefObject, PointerEvent } from 'react'
import styles from './NudgePad.module.css'

type NudgeDirection = {
  direction: 'down' | 'left' | 'right' | 'up'
  dx: number
  dy: number
  symbol: string
  title: string
}

type NudgePadProps = {
  canEditAccents: boolean
  directions: readonly NudgeDirection[]
  suppressClickRef: MutableRefObject<boolean>
  onNudge: (deltaX: number, deltaY: number) => void
  onStartNudgeRepeat: (
    event: PointerEvent<HTMLButtonElement>,
    deltaX: number,
    deltaY: number,
  ) => void
  onStopNudgeRepeat: () => void
}

export function NudgePad({
  canEditAccents,
  directions,
  suppressClickRef,
  onNudge,
  onStartNudgeRepeat,
  onStopNudgeRepeat,
}: NudgePadProps) {
  return (
    <div className={styles.pad}>
      {directions.map(({ direction, dx, dy, symbol, title }) => (
        <button
          className={styles[direction]}
          disabled={!canEditAccents}
          key={direction}
          onClick={(event) => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false
              event.preventDefault()
              return
            }
            onNudge(dx, dy)
          }}
          onPointerCancel={onStopNudgeRepeat}
          onPointerDown={(event) => onStartNudgeRepeat(event, dx, dy)}
          onPointerLeave={onStopNudgeRepeat}
          onPointerUp={onStopNudgeRepeat}
          title={title}
          type="button"
        >
          {symbol}
        </button>
      ))}
    </div>
  )
}
