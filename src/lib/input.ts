import Papa from 'papaparse'
import type { InputItem } from '../types'

export type ParsedCsv = {
  headers: Array<{ index: number; label: string }>
  rows: string[][]
}

function normalizeValue(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function toInputItems(source: string | string[][], selectedColumn = 0): InputItem[] {
  if (typeof source === 'string') {
    return source
      .split(/\r?\n/)
      .map(normalizeValue)
      .filter(Boolean)
      .map((name, index) => ({
        id: `text-${index}-${name}`,
        name,
        sourceIndex: index,
      }))
  }

  return source
    .map((row) => normalizeValue(row[selectedColumn] ?? ''))
    .filter(Boolean)
    .map((name, index) => ({
      id: `csv-${index}-${name}`,
      name,
      sourceIndex: index,
    }))
}

export function parseCsvText(text: string): ParsedCsv {
  const parsed = Papa.parse<string[]>(text.trim(), {
    skipEmptyLines: true,
  })

  const rows = parsed.data.filter((row: string[]) =>
    row.some((cell: string) => normalizeValue(cell)),
  )

  if (rows.length === 0) {
    return {
      headers: [{ index: 0, label: 'Colonne 1' }],
      rows: [],
    }
  }

  const firstRow = rows[0]
  const headers = firstRow.map((cell: string, index: number) => ({
    index,
    label: normalizeValue(cell) || `Colonne ${index + 1}`,
  }))

  return {
    headers,
    rows: rows.slice(1),
  }
}
