import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { translateAppFeedback, type AppFeedback, type AppLanguage } from '../lib/i18n'
import {
  DEFAULT_BOARD_SETTINGS,
  DEFAULT_INPUT_TEXT,
  DEFAULT_RENDER_SETTINGS,
} from '../lib/constants'
import { parseCsvText, toInputItems, type ParsedCsv } from '../lib/input'
import { buildBoardPages } from '../lib/layout'
import type { GlyphMap } from '../lib/glyphs'
import type { BoardPage, BoardSettings, InputItem, TextRenderSettings } from '../types'

export type UseConfiguratorStateResult = {
  boardSettings: BoardSettings
  currentBoard: BoardPage | undefined
  currentPage: number
  currentPageIndex: number
  csvColumns: ParsedCsv['headers']
  inputItems: InputItem[]
  pages: BoardPage[]
  previewScale: number
  rawText: string
  renderSettings: TextRenderSettings
  selectedColumn: string
  sourceMode: 'text' | 'csv'
  statusMessage: string
  onCsvUpload: (file: File) => Promise<void>
  setCurrentPage: (value: number) => void
  setRawText: (value: string) => void
  setSelectedColumn: (value: string) => void
  setSourceMode: (value: 'text' | 'csv') => void
  setStatusMessage: (value: AppFeedback | null) => void
  updateBoardSetting: <Key extends keyof BoardSettings>(key: Key, value: number) => void
  updateRenderSetting: <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => void
}

export function useConfiguratorState(
  glyphMap: GlyphMap | null,
  language: AppLanguage,
): UseConfiguratorStateResult {
  const [sourceMode, setSourceMode] = useState<'text' | 'csv'>('text')
  const [rawText, setRawText] = useState(DEFAULT_INPUT_TEXT)
  const [csvData, setCsvData] = useState<ParsedCsv | null>(null)
  const [selectedColumn, setSelectedColumn] = useState('0')
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS)
  const [renderSettings, setRenderSettings] = useState<TextRenderSettings>(DEFAULT_RENDER_SETTINGS)
  const [currentPage, setCurrentPage] = useState(0)
  const [statusFeedback, setStatusFeedback] = useState<AppFeedback | null>(null)

  const deferredRawText = useDeferredValue(rawText)

  const inputItems = useMemo<InputItem[]>(() => {
    if (sourceMode === 'csv' && csvData) {
      return toInputItems(csvData.rows, Number(selectedColumn))
    }

    return toInputItems(deferredRawText)
  }, [csvData, deferredRawText, selectedColumn, sourceMode])

  const pages = useMemo<BoardPage[]>(() => {
    if (!glyphMap) {
      return []
    }

    return buildBoardPages(inputItems, glyphMap, renderSettings, boardSettings)
  }, [boardSettings, glyphMap, inputItems, renderSettings])

  const onCsvUpload = async (file: File) => {
    const text = await file.text()
    const parsed = parseCsvText(text)

    startTransition(() => {
      setCsvData(parsed)
      setSelectedColumn(parsed.headers[0]?.index.toString() ?? '0')
      setSourceMode('csv')
      setCurrentPage(0)
    })
  }

  const updateBoardSetting = <Key extends keyof BoardSettings>(key: Key, value: number) => {
    setBoardSettings((previous) => ({ ...previous, [key]: value }))
  }

  const updateRenderSetting = <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => {
    setRenderSettings((previous) => ({ ...previous, [key]: value }))
  }

  const currentPageIndex = pages.length === 0 ? 0 : Math.min(currentPage, pages.length - 1)
  const currentBoard = pages[currentPageIndex]
  const previewScale = currentBoard
    ? Math.min(1, 720 / Math.max(currentBoard.widthMm, currentBoard.heightMm))
    : 1
  const statusMessage = useMemo(
    () => translateAppFeedback(language, statusFeedback),
    [language, statusFeedback],
  )

  return {
    boardSettings,
    currentBoard,
    currentPage,
    currentPageIndex,
    csvColumns: csvData?.headers ?? [],
    inputItems,
    pages,
    previewScale,
    rawText,
    renderSettings,
    selectedColumn,
    sourceMode,
    statusMessage,
    onCsvUpload,
    setCurrentPage,
    setRawText,
    setSelectedColumn,
    setSourceMode,
    setStatusMessage: setStatusFeedback,
    updateBoardSetting,
    updateRenderSetting,
  }
}
