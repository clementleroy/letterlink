import styles from './InputSection.module.css'

type TextSourceInputProps = {
  label: string
  rawText: string
  onSetRawText: (value: string) => void
}

export function TextSourceInput({ label, rawText, onSetRawText }: TextSourceInputProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea
        onChange={(event) => onSetRawText(event.target.value)}
        placeholder={'Elodie\nMaelys\nAnais'}
        rows={10}
        value={rawText}
      />
    </label>
  )
}
