import type { ChangeEvent } from 'react'
import styles from './InputSection.module.css'

type CsvSourceInputProps = {
  columns: Array<{ index: number; label: string }>
  importLabel: string
  selectedColumn: string
  selectLabel: string
  onCsvUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSetSelectedColumn: (value: string) => void
}

export function CsvSourceInput({
  columns,
  importLabel,
  selectedColumn,
  selectLabel,
  onCsvUpload,
  onSetSelectedColumn,
}: CsvSourceInputProps) {
  return (
    <>
      <label className={styles.importCard}>
        <span>{importLabel}</span>
        <input accept=".csv,text/csv" onChange={onCsvUpload} type="file" />
      </label>
      {columns.length > 0 ? (
        <label className={styles.field}>
          <span>{selectLabel}</span>
          <select onChange={(event) => onSetSelectedColumn(event.target.value)} value={selectedColumn}>
            {columns.map((column) => (
              <option key={column.index} value={column.index}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  )
}
