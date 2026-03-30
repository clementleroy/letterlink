import type { LetterlinkGlyph } from '../../../types'
import styles from './ToolbarGroup.module.css'

type LetterNavigationGroupProps = {
  availableGlyphChars: string[]
  canSelectNextGlyph: boolean
  canSelectPreviousGlyph: boolean
  label: string
  nextLabel: string
  previousLabel: string
  selectedGlyph: LetterlinkGlyph | null
  selectedGlyphChar: string
  spaceLabel: string
  onSelectGlyphChar: (value: string) => void
  onSelectNextGlyph: () => void
  onSelectPreviousGlyph: () => void
}

export function LetterNavigationGroup({
  availableGlyphChars,
  canSelectNextGlyph,
  canSelectPreviousGlyph,
  label,
  nextLabel,
  previousLabel,
  selectedGlyph,
  selectedGlyphChar,
  spaceLabel,
  onSelectGlyphChar,
  onSelectNextGlyph,
  onSelectPreviousGlyph,
}: LetterNavigationGroupProps) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.letterNavControl}>
        <button
          aria-label={previousLabel}
          className={styles.letterNavButton}
          disabled={!selectedGlyph || !canSelectPreviousGlyph}
          onClick={onSelectPreviousGlyph}
          type="button"
        >
          ‹
        </button>
        <select
          className={styles.letterNavSelect}
          disabled={!selectedGlyph}
          onChange={(event) => onSelectGlyphChar(event.target.value)}
          value={selectedGlyphChar}
        >
          {availableGlyphChars.map((char) => (
            <option key={char} value={char}>
              {char === ' ' ? spaceLabel : char}
            </option>
          ))}
        </select>
        <button
          aria-label={nextLabel}
          className={styles.letterNavButton}
          disabled={!selectedGlyph || !canSelectNextGlyph}
          onClick={onSelectNextGlyph}
          type="button"
        >
          ›
        </button>
      </div>
    </div>
  )
}
