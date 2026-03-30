import { useState } from 'react'
import type { BoardPage, PlacedItem, TextRenderSettings, AppStrings } from '../../../types'
import styles from './BoardCanvas.module.css'

type BoardCanvasProps = {
  currentBoard: BoardPage
  marginMm: number
  previewScale: number
  renderSettings: TextRenderSettings
  strings: AppStrings['preview']
}

export function BoardCanvas({
  currentBoard,
  marginMm,
  previewScale,
  renderSettings,
  strings,
}: BoardCanvasProps) {
  const [hoveredItem, setHoveredItem] = useState<PlacedItem | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  return (
    <div
      className={styles.frame}
      style={{ width: `${currentBoard.widthMm * previewScale}px` }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
    >
      <svg
        aria-label={strings.boardAriaLabel(currentBoard.index + 1)}
        className={styles.svg}
        height={`${currentBoard.heightMm}mm`}
        viewBox={`0 0 ${currentBoard.widthMm} ${currentBoard.heightMm}`}
        width={`${currentBoard.widthMm}mm`}
      >
        <rect
          className={styles.background}
          height={currentBoard.heightMm}
          rx="3"
          width={currentBoard.widthMm}
        />
        <rect
          className={styles.margin}
          height={currentBoard.heightMm - marginMm * 2}
          rx="1.5"
          width={currentBoard.widthMm - marginMm * 2}
          x={marginMm}
          y={marginMm}
        />
        {currentBoard.items.map((item) => (
          <g
            key={`${item.id}-${item.name}`}
            className={styles.itemGroup}
            transform={`translate(${item.xMm} ${item.yMm})`}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <rect className={styles.hitArea} height={item.heightMm} rx={0.8} width={item.widthMm} />
            {renderSettings.renderMode === 'fill' ? (
              <path d={item.pathData} fill="currentColor" />
            ) : (
              <path
                d={item.pathData}
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth={renderSettings.strokeWidthMm}
              />
            )}
          </g>
        ))}
      </svg>
      {hoveredItem && (
        <div
          className={styles.tooltip}
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          {hoveredItem.widthMm.toFixed(1)} × {hoveredItem.heightMm.toFixed(1)} mm
        </div>
      )}
    </div>
  )
}
