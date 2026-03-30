import type { ChangeEvent } from 'react'
import styles from './ImportOptionCard.module.css'

type ImportOptionCardProps = {
  accept: string
  label: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ImportOptionCard({ accept, label, onChange }: ImportOptionCardProps) {
  return (
    <label className={styles.card}>
      <span className={styles.label}>{label}</span>
      <input accept={accept} className={styles.input} onChange={onChange} type="file" />
    </label>
  )
}
