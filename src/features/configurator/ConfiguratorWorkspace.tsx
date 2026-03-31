import type { ChangeEvent } from 'react'
import type {
  AppStrings,
  BoardPage,
  BoardSettings,
  LetterlinkProject,
  TextRenderSettings,
} from '../../types'
import styles from './components/ConfiguratorWorkspace.module.css'
import { BoardPreviewPanel } from './BoardPreviewPanel'
import { ConfiguratorControlsPanel } from './ConfiguratorControlsPanel'

type ConfiguratorWorkspaceProps = {
  boardSettings: BoardSettings
  csvColumns: Array<{ index: number; label: string }>
  currentBoard: BoardPage | undefined
  currentPageIndex: number
  entries: number
  pages: BoardPage[]
  previewScale: number
  project: LetterlinkProject | null
  rawText: string
  renderSettings: TextRenderSettings
  selectedColumn: string
  sourceMode: 'text' | 'csv'
  statusMessage: string
  strings: AppStrings
  onCsvUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onCurrentPageChange: (pageIndex: number) => void
  onDownloadBoard: () => void
  onDownloadNames: () => void
  onDownloadProject: () => void
  onDownloadAll: () => void
  onSetRawText: (value: string) => void
  onSetSelectedColumn: (value: string) => void
  onSetSourceMode: (value: 'text' | 'csv') => void
  updateBoardSetting: <Key extends keyof BoardSettings>(key: Key, value: number) => void
  updateRenderSetting: <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => void
}

export function ConfiguratorWorkspace(props: ConfiguratorWorkspaceProps) {
  return (
    <section className={styles.workspace}>
      <ConfiguratorControlsPanel
        boardSettings={props.boardSettings}
        csvColumns={props.csvColumns}
        project={props.project}
        rawText={props.rawText}
        renderSettings={props.renderSettings}
        selectedColumn={props.selectedColumn}
        sourceMode={props.sourceMode}
        statusMessage={props.statusMessage}
        strings={props.strings}
        onCsvUpload={props.onCsvUpload}
        onDownloadProject={props.onDownloadProject}
        onSetRawText={props.onSetRawText}
        onSetSelectedColumn={props.onSetSelectedColumn}
        onSetSourceMode={props.onSetSourceMode}
        updateBoardSetting={props.updateBoardSetting}
        updateRenderSetting={props.updateRenderSetting}
      />
      <div className={styles.previewStack}>
        <BoardPreviewPanel
          currentBoard={props.currentBoard}
          currentPageIndex={props.currentPageIndex}
          marginMm={props.boardSettings.marginMm}
          pages={props.pages}
          previewScale={props.previewScale}
          renderSettings={props.renderSettings}
          strings={props.strings}
          onCurrentPageChange={props.onCurrentPageChange}
          onDownloadBoard={props.onDownloadBoard}
          onDownloadNames={props.onDownloadNames}
          onDownloadProject={props.onDownloadProject}
          onDownloadAll={props.onDownloadAll}
        />
      </div>
    </section>
  )
}
