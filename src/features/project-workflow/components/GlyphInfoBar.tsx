import type { LetterlinkGlyph } from '../../../types'
import styles from './GlyphInfoBar.module.css'

type GlyphInfoBarProps = {
  accentOffsetLabel: string
  endPointLabel: string
  notSetLabel: string
  selectedAccent: LetterlinkGlyph['accentParts'][number] | null
  selectedGlyph: LetterlinkGlyph | null
  startPointLabel: string
}

export function GlyphInfoBar({
  accentOffsetLabel,
  endPointLabel,
  notSetLabel,
  selectedAccent,
  selectedGlyph,
  startPointLabel,
}: GlyphInfoBarProps) {
  const items = [
    {
      label: startPointLabel,
      value: `${selectedGlyph?.leftConnectXRefMm ?? 'auto'} / ${
        selectedGlyph?.leftConnectYRefMm ?? 'auto'
      } mm`,
    },
    {
      label: endPointLabel,
      value: `${selectedGlyph?.rightConnectXRefMm ?? 'auto'} / ${
        selectedGlyph?.rightConnectYRefMm ?? 'auto'
      } mm`,
    },
    {
      label: accentOffsetLabel,
      value: selectedAccent
        ? `${selectedAccent.xOffsetRefMm} / ${selectedAccent.yOffsetRefMm} mm`
        : notSetLabel,
    },
  ]

  return (
    <div className={styles.infoBar}>
      {items.map((item) => (
        <span className={styles.item} key={item.label}>
          <span className={styles.label}>{item.label}</span>
          <strong>{item.value}</strong>
        </span>
      ))}
    </div>
  )
}
