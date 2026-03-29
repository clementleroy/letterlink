import type { ChangeEvent, ReactNode } from 'react'
import type {
  BoardPage,
  BoardSettings,
  GlyphDebugAnchor,
  LetterlinkProject,
  TextRenderSettings,
} from '../../types'
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
  showDebugAnchors: boolean
  sourceMode: 'text' | 'csv'
  statusMessage: string
  renderBoardDebugAnchors: (itemId: string, anchors: GlyphDebugAnchor[] | undefined) => ReactNode
  onCsvUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onCurrentPageChange: (pageIndex: number) => void
  onDownloadBoard: () => void
  onDownloadProject: () => void
  onDownloadAll: () => void
  onSetRawText: (value: string) => void
  onSetSelectedColumn: (value: string) => void
  onSetShowDebugAnchors: (value: boolean) => void
  onSetSourceMode: (value: 'text' | 'csv') => void
  updateBoardSetting: <Key extends keyof BoardSettings>(key: Key, value: number) => void
  updateRenderSetting: <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => void
}

export function ConfiguratorWorkspace(props: ConfiguratorWorkspaceProps) {
  return (
    <section className="workspace">
      <ConfiguratorControlsPanel
        boardSettings={props.boardSettings}
        csvColumns={props.csvColumns}
        project={props.project}
        rawText={props.rawText}
        renderSettings={props.renderSettings}
        selectedColumn={props.selectedColumn}
        showDebugAnchors={props.showDebugAnchors}
        sourceMode={props.sourceMode}
        statusMessage={props.statusMessage}
        onCsvUpload={props.onCsvUpload}
        onDownloadProject={props.onDownloadProject}
        onSetRawText={props.onSetRawText}
        onSetSelectedColumn={props.onSetSelectedColumn}
        onSetShowDebugAnchors={props.onSetShowDebugAnchors}
        onSetSourceMode={props.onSetSourceMode}
        updateBoardSetting={props.updateBoardSetting}
        updateRenderSetting={props.updateRenderSetting}
      />
      <div className="preview-stack">
        <BoardPreviewPanel
          currentBoard={props.currentBoard}
          currentPageIndex={props.currentPageIndex}
          entries={props.entries}
          pages={props.pages}
          previewScale={props.previewScale}
          project={props.project}
          renderSettings={props.renderSettings}
          renderBoardDebugAnchors={props.renderBoardDebugAnchors}
          onCurrentPageChange={props.onCurrentPageChange}
          onDownloadBoard={props.onDownloadBoard}
          onDownloadProject={props.onDownloadProject}
          onDownloadAll={props.onDownloadAll}
        />
      </div>
    </section>
  )
}
